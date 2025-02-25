import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateAgendamentoDto,
  StatusAgendamento,
} from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { PrismaService } from 'src/prisma.service';
import { ClienteService } from 'src/cliente/cliente.service';
import { ProtocoloService } from 'src/cliente/protocolo/protocolo.service';

@Injectable()
export class AgendamentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clienteService: ClienteService,
    private readonly protocoloService: ProtocoloService,
  ) {}

  async create(createAgendamentoDto: CreateAgendamentoDto, headers: Headers) {
    await this.isAdmin(headers);

    const { funcionarioId, Cliente, dataHora } = createAgendamentoDto;
    const validadeHorarioFuncionario = await this.prisma.agendamento.findFirst({
      where: {
        dataHora: dataHora,
        funcionarioId: funcionarioId,
      },
    });

    if (validadeHorarioFuncionario)
      return new HttpException(
        'Funcionario não tem essa data disponível',
        HttpStatus.CONFLICT,
      );

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

        console.log(existingCliente.id, existingProtocolo.id);

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
      } else {
        return {
          message: 'Já existe um agendamento nessa data e protocolo!',
          data: existingAgendamentoByHoraAndProtocolo,
        };
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Erro ao cadastrar',
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

    const agendamentos = await this.prisma.agendamento.findMany({});
    return {
      message: `This action returns all agendamento`,
      data: agendamentos,
    };
  }

  async findOne(id: number, headers: Headers) {
    await this.isAdminOrFuncionario(headers);

    return `This action returns a #${id} agendamento`;
  }

  async update(
    id: number,
    updateAgendamentoDto: UpdateAgendamentoDto,
    headers: Headers,
  ) {
    await this.isAdminOrFuncionario(headers);

    return `This action updates a #${id} agendamento`;
  }

  async remove(id: number, headers: Headers) {
    await this.isAdminOrFuncionario(headers);
    return `This action removes a #${id} agendamento`;
  }

  private async isAdminOrFuncionario(headers: Headers) {
    const adminEmail = headers['admin'] || '';
    const funcionarioEmail = headers['funcionario'] || '';

    if (!adminEmail && !funcionarioEmail)
      throw new HttpException('Sem Permissão!', HttpStatus.LOCKED);

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
      throw new HttpException('Sem Permissão!', HttpStatus.LOCKED);
  }

  private async isAdmin(headers: Headers) {
    const adminEmail = headers['admin'] || '';

    if (!adminEmail)
      throw new HttpException('Sem Permissão!', HttpStatus.UNAUTHORIZED);

    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!isAdmin)
      throw new HttpException('Sem Permissão!', HttpStatus.UNAUTHORIZED);
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
}

// '0': 'AGENDADO'
// '1': 'CANCELADO'
// '2': 'NAO_COMPARECEU'
// '3': 'ENCERRADO'
// '4': 'EMITIDO'
// '5': 'REAGENDADO'
// '6': 'REAGENDAR'
