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
    const data = new Date(dataHora);
    const agora = new Date();

    const diferencaHoras =
      (data.getTime() - agora.getTime()) / (1000 * 60 * 60);

    if (diferencaHoras < 2)
      throw new HttpException(
        "Agendamento para hoje deve ter pelo menos 2 horas de antecedência!",
        HttpStatus.CONFLICT,
      );

    if (!Cliente)
      return new HttpException(
        "Cliente não encontrado, favor informar!",
        HttpStatus.NOT_FOUND,
      );
    const funcionariosDisponiveis = await this.prisma.user.findMany({
      where: {
        agendamentos: {
          none: { dataHora: dataHora },
        },
        role: {
          not: "ADMIN",
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    if (!funcionariosDisponiveis)
      return new HttpException(
        "Não tem funcionario disponível nessa data!",
        HttpStatus.CONFLICT,
      );

    let funcionarioDisponivel;

    for (const funcionario of funcionariosDisponiveis) {
      const disponivel = await this.isFuncionarioDisponivel(
        funcionario.id,
        data,
      );
      if (disponivel) {
        funcionarioDisponivel = funcionario;
        break;
      }
    }
    if (!funcionarioDisponivel) {
      throw new HttpException(
        "Funcionário não está disponível neste horário",
        HttpStatus.CONFLICT,
      );
    }
    const userId = funcionarioDisponivel.id;

    try {
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
            userId: userId,
            protocoloId: existingProtocolo.id,
          },
          include: {
            protocolo: true,
          },
        });

        return agendamento;
      }

      throw new HttpException(
        "Já existe um agendamento nessa data e protocolo!",
        HttpStatus.CONFLICT,
      );
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
        User: {
          omit: {
            senha: true,
            criadoEm: true,
            atualizadoEm: true,
            passwordResetTokenId: true,
          },
        },
        protocolo: {
          include: {
            cliente: true,
          },
        },
      },
    });
    return { data: agendamentos, count: agendamentos.length };
  }

  async findAllAgendamentos(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpException(
        'Formato de data inválido. Use "YYYY-MM-DDTHH:mm:ss.sssZ".',
        HttpStatus.BAD_REQUEST,
      );
    }

    const agendamentos = await this.prisma.agendamento.findMany({
      where: {
        dataHora: {
          gte: startDate,
          lte: endDate,
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
        User: {
          omit: {
            senha: true,
            criadoEm: true,
            atualizadoEm: true,
            passwordResetTokenId: true,
          },
        },
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
      select: {
        id: true,
        dataHora: true,
        status: true,
        userId: true,
        User: {
          omit: {
            senha: true,
            criadoEm: true,
            atualizadoEm: true,
            passwordResetTokenId: true,
          },
        },
        protocoloId: true,
        protocolo: {
          include: {
            cliente: {
              omit: {
                criadoEm: true,
                atualizadoEm: true,
              },
            },
          },
        },
      },
      orderBy: {
        User: {
          nome: "asc",
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

    if (!updateAgendamentoDto.userId) {
      funcionarioDisponivel = await this.prisma.user.findFirst({
        where: {
          agendamentos: {
            none: { dataHora: agendamento.dataHora },
          },
          NOT: {
            role: "ADMIN",
          },
        },
      });

      if (!funcionarioDisponivel)
        return new HttpException(
          "Não tem funcionario disponível nessa data!",
          HttpStatus.CONFLICT,
        );
    }

    const userId: string = updateAgendamentoDto?.userId
      ? updateAgendamentoDto?.userId
      : funcionarioDisponivel?.id;

    if (!userId) return;

    const disponivel = await this.isFuncionarioDisponivel(
      userId,
      agendamento.dataHora,
    );

    if (!disponivel) {
      throw new HttpException(
        "Não tem funcionário disponível neste horário",
        HttpStatus.CONFLICT,
      );
    }

    const agendamentoExistente = await this.prisma.agendamento.findFirst({
      where: {
        userId: userId,
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
        User: true,
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
        userId: userId,
      },
      include: {
        User: true,
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
      agendamentoMarcado?.id,
      new Date(novaDataMarcada),
    );
    let novoFuncionario;

    const diaDaSemana = new Date(novaDataMarcada).getDay();

    if (!funcionarioDisponivel) {
      novoFuncionario = await this.prisma.user.findFirst({
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
          userId: novoFuncionario?.id,
        },
        include: {
          User: {
            omit: {
              senha: true,
              atualizadoEm: true,
              criadoEm: true,
              passwordResetTokenId: true,
            },
          },
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

    const isAdmin = await this.prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!isAdmin) throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);
  }

  private async isAdmin(headers: Headers) {
    const adminEmail = headers["admin"] || "";

    if (!adminEmail)
      throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);

    const isAdmin = await this.prisma.user.findUnique({
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

  private async isFuncionarioDisponivel(userId: string, dataHora: Date) {
    console.log("dataHora", dataHora);
    const diaSemana = dataHora.getDay(); //0 = Domingo, ....
    const horaAgendamento = dataHora.toTimeString().split(" ")[0]; // pegar apenas HH:mm:ss
    console.log("horaAgendamento", horaAgendamento);

    // Buscar horários de expediente do funcionário no dia específico
    const horario = await this.prisma.horario.findFirst({
      where: {
        userId: userId,
        diaSemana: diaSemana,
      },
    });

    console.log("horario", horario);

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
        userId: userId,
        dataHora: dataHora,
      },
    });

    if (agendamentoExistente) {
      return false; // ❌ Funcionário já tem um agendamento nesse horário
    }

    // Verificar se o funcionário está indisponível nesse horário
    const indisponivel = await this.prisma.indisponibilidade.findFirst({
      where: {
        userId: userId,
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
