import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  CreateAgendamentoDto,
  StatusAgendamento,
} from "./dto/create-agendamento.dto";
import { UpdateAgendamentoDto } from "./dto/update-agendamento.dto";
import { PrismaService } from "src/prisma.service";
import { ClienteService } from "src/cliente/cliente.service";
import { ProtocoloService } from "src/cliente/protocolo/protocolo.service";

@Injectable()
export class AgendamentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clienteService: ClienteService,
    private readonly protocoloService: ProtocoloService,
  ) {}

  async create(createAgendamentoDto: CreateAgendamentoDto) {
    const { Cliente, dataHora } = createAgendamentoDto;

    if (!Cliente)
      return new HttpException(
        "Cliente não encontrado, favor informar!",
        HttpStatus.NOT_FOUND,
      );
    const funcionarioDisponivel = await this.prisma.funcionario.findFirst({
      where: {
        agendamentos: {
          none: { dataHora: createAgendamentoDto.dataHora },
        },
      },
    });

    if (!funcionarioDisponivel)
      return new HttpException(
        "Não tem funcionario disponível nessa data!",
        HttpStatus.CONFLICT,
      );

    const funcionarioId = funcionarioDisponivel.id;
    const data = new Date(dataHora);

    try {
      const disponivel = await this.isFuncionarioDisponivel(
        funcionarioId,
        data,
      );

      if (!disponivel) {
        throw new HttpException(
          "Funcionário não está disponível neste horário",
          HttpStatus.CONFLICT,
        );
      }
      const existingAgendamentoByHoraAndProtocolo =
        await this.prisma.agendamento.findFirst({
          where: {
            dataHora: dataHora,
            protocolo: {
              codigo: Cliente.protocolo,
            },
          },
        });

      if (!existingAgendamentoByHoraAndProtocolo) {
        const existingCliente =
          await this.clienteService.createOrReturnCliente(Cliente);

        const existingProtocolo =
          await this.protocoloService.createOrReturnProtocolo(
            Cliente.protocolo,
            existingCliente?.id,
          );

        const agendamento = await this.prisma.agendamento.create({
          data: {
            dataHora: dataHora,
            funcionarioId: funcionarioId,
            protocoloId: existingProtocolo.id,
          },
          include: {
            protocolo: true,
          },
        });

        return agendamento;
      }

      return {
        message: "Já existe um agendamento nessa data e protocolo!",
        data: existingAgendamentoByHoraAndProtocolo,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  async findAll(headers: Headers) {
    await this.isAdmin(headers);

    const agendamentos = await this.prisma.agendamento.findMany({
      include: {
        funcionario: true,
        protocolo: {
          include: {
            cliente: true,
          },
        },
      },
    });
    return { data: agendamentos, count: agendamentos.length };
  }

  async findOne(id: string, headers: Headers) {
    await this.isAdminOrFuncionario(headers);
    const agendamentoById = await this.prisma.agendamento.findFirst({
      where: {
        id,
      },
      include: {
        funcionario: true,
        protocolo: {
          include: {
            cliente: true,
          },
        },
      },
    });

    return { data: agendamentoById, count: 1 };
  }

  async findAgendamentoByRangeTime(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpException(
        'Formato de data inválido. Use "YYYY-MM-DDTHH:mm:ss.sssZ".',
        HttpStatus.BAD_REQUEST,
      );
    }
    const rangeAgendamento = await this.prisma.agendamento.findMany({
      where: {
        dataHora: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        funcionario: true,
        protocolo: {
          include: {
            cliente: true,
          },
        },
      },
    });
    return { data: rangeAgendamento, count: rangeAgendamento.length };
  }

  async updateFuncionarioAgendamento(
    id: string,
    updateAgendamentoDto: UpdateAgendamentoDto,
    headers: Headers,
  ) {
    await this.isAdminOrFuncionario(headers);

    let funcionarioDisponivel;

    const agendamento = await this.prisma.agendamento.findFirst({
      where: {
        id: id,
      },
    });

    if (!agendamento)
      return new HttpException(
        "Agendamento não encontrado",
        HttpStatus.BAD_REQUEST,
      );

    if (!updateAgendamentoDto.funcionarioId) {
      funcionarioDisponivel = await this.prisma.funcionario.findFirst({
        where: {
          agendamentos: {
            none: { dataHora: agendamento.dataHora },
          },
        },
      });

      if (!funcionarioDisponivel)
        return new HttpException(
          "Não tem funcionario disponível nessa data!",
          HttpStatus.CONFLICT,
        );
    }

    const funcionarioId = updateAgendamentoDto?.funcionarioId
      ? updateAgendamentoDto?.funcionarioId
      : funcionarioDisponivel?.id;

    if (!funcionarioId) return;

    const disponivel = await this.isFuncionarioDisponivel(
      funcionarioId,
      agendamento.dataHora,
    );

    if (!disponivel) {
      throw new HttpException(
        "Funcionário não está disponível neste horário",
        HttpStatus.CONFLICT,
      );
    }

    const agendamentoExistente = await this.prisma.agendamento.findFirst({
      where: {
        funcionarioId: funcionarioId,
        dataHora: {
          equals: (
            await this.prisma.agendamento.findUnique({
              where: { id: id },
              select: { dataHora: true },
            })
          )?.dataHora,
        },
      },
      include: {
        funcionario: true,
      },
    });

    if (agendamentoExistente) {
      throw new HttpException(
        "Já existe um agendamento para esse funcionário nesse horário!",
        HttpStatus.CONFLICT,
      );
    }

    const updateAgendamento = await this.prisma.agendamento.update({
      where: {
        id: id,
      },
      data: {
        funcionarioId: funcionarioId,
      },
      include: {
        funcionario: true,
      },
    });

    return { data: updateAgendamento };
  }

  async updateDateAgendamento(
    id: string,
    updateAgendamentoDto: UpdateAgendamentoDto,
    headers: Headers,
  ) {
    await this.isAdmin(headers);
    const novaDataMarcada = updateAgendamentoDto.dataHora;

    if (!novaDataMarcada) {
      throw new HttpException("DataHora is required", HttpStatus.BAD_REQUEST);
    }

    // ver qual funcionario está nesse agendamento
    const agendamentoMarcado = await this.prisma.agendamento.findFirst({
      where: {
        id: id,
      },
    });

    if (!agendamentoMarcado || !novaDataMarcada) return;
    // verificar se funcionario está disponivel

    const funcionarioDisponivel = await this.isFuncionarioDisponivel(
      agendamentoMarcado?.funcionarioId,
      new Date(novaDataMarcada),
    );
    let novoFuncionario;

    const diaDaSemana = new Date(novaDataMarcada).getDay();

    if (!funcionarioDisponivel) {
      novoFuncionario = await this.prisma.funcionario.findFirst({
        where: {
          agendamentos: {
            none: {
              dataHora: novaDataMarcada,
            },
          },
        },
        include: {
          horarios: {
            where: {
              diaSemana: diaDaSemana,
            },
          },
        },
      });

      if (!novoFuncionario)
        return new HttpException(
          "Não tem funcionario disponível nessa data!",
          HttpStatus.CONFLICT,
        );
    }

    try {
      const agendamento = await this.prisma.agendamento.update({
        where: {
          id,
        },
        data: {
          dataHora: novaDataMarcada,
          funcionarioId: novoFuncionario?.id,
        },
        include: {
          funcionario: true,
        },
      });

      return { data: agendamento };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error?.message,
        },
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  async removeAgendamento(id: string, headers: Headers) {
    await this.isAdminOrFuncionario(headers);

    const agendamento = await this.prisma.agendamento.findFirst({
      where: {
        id,
      },
    });
    if (!agendamento)
      return new HttpException(
        "Agendamento não encontrado!",
        HttpStatus.BAD_REQUEST,
      );

    const deleteAgendamento = await this.prisma.agendamento.delete({
      where: {
        id,
      },
    });
    return { data: deleteAgendamento };
  }

  private async isAdminOrFuncionario(headers: Headers) {
    const adminEmail = headers["admin"] || "";
    const funcionarioEmail = headers["funcionario"] || "";

    if (!adminEmail && !funcionarioEmail)
      throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);

    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: adminEmail,
      },
    });

    const isFuncionario = await this.prisma.funcionario.findUnique({
      where: {
        email: funcionarioEmail,
      },
    });

    if (!isAdmin && !isFuncionario)
      throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);
  }

  private async isAdmin(headers: Headers) {
    const adminEmail = headers["admin"] || "";

    if (!adminEmail)
      throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);

    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!isAdmin) throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);
  }

  private validateStatus(
    status: StatusAgendamento | undefined,
  ): StatusAgendamento {
    // '0': 'AGENDADO'
    // '1': 'CANCELADO'
    // '2': 'NAO_COMPARECEU'
    // '3': 'ENCERRADO'
    // '4': 'EMITIDO'
    // '5': 'REAGENDADO'
    // '6': 'REAGENDAR'
    // Se for uma string, convertemos para número
    if (status && status in StatusAgendamento) {
      return StatusAgendamento[
        status as unknown as keyof typeof StatusAgendamento
      ];
    } else {
      throw new HttpException(
        `Status inválido: ${status}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async isFuncionarioDisponivel(funcionarioId: string, dataHora: Date) {
    const diaSemana = dataHora.getDay(); //0 = Domingo, ....
    const horaAgendamento = dataHora.toTimeString().split(" ")[0]; // pegar apenas HH:mm:ss

    // Buscar horários de expediente do funcionário no dia específico
    const horario = await this.prisma.horario.findFirst({
      where: {
        funcionarioId: funcionarioId,
        diaSemana: diaSemana,
      },
    });

    if (!horario) return false; // Funcionário não tem essa hora disponível

    // Verificar se o horário do agendamento está dentro do expediente
    if (
      horaAgendamento < horario.startTime ||
      horaAgendamento >= horario.endTime
    ) {
      return false; // ❌ Fora do horário de expediente
    }

    // Verificar se o horário do agendamento está dentro do intervalo de almoço
    if (
      horaAgendamento >= horario.breakStart &&
      horaAgendamento < horario.breakEnd
    ) {
      return false; // ❌ Funcionário está em pausa
    }

    // Verificar se já existe um agendamento nesse horário
    const agendamentoExistente = await this.prisma.agendamento.findFirst({
      where: {
        funcionarioId: funcionarioId,
        dataHora: dataHora,
      },
    });

    if (agendamentoExistente) {
      return false; // ❌ Funcionário já tem um agendamento nesse horário
    }

    // Verificar se o funcionário está indisponível nesse horário
    const indisponivel = await this.prisma.indisponibilidade.findFirst({
      where: {
        funcionarioId: funcionarioId,
        OR: [
          {
            dataInicio: { lte: dataHora }, // Indisponibilidade começa antes ou exatamente nesse horário
            dataFim: { gte: dataHora }, // Indisponibilidade termina depois ou exatamente nesse horário
          },
        ],
      },
    });

    if (indisponivel) return false; // ❌ Funcionário está indisponível

    return true;
  }
}

// '0': 'AGENDADO'
// '1': 'CANCELADO'
// '2': 'NAO_COMPARECEU'
// '3': 'ENCERRADO'
// '4': 'EMITIDO'
// '5': 'REAGENDADO'
// '6': 'REAGENDAR'
