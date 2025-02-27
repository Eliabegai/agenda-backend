import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  CreateFuncionarioDto,
  HorarioDto,
  IndisponibilidadeDto,
} from "./dto/create-funcionario.dto";
import { UpdateFuncionarioDto } from "./dto/update-funcionario.dto";
import { PrismaService } from "src/prisma.service";
import { validateOrReject } from "class-validator";

@Injectable()
export class FuncionarioService {
  constructor(private readonly prisma: PrismaService) {}

  async createFuncionario(
    createFuncionarioDto: CreateFuncionarioDto,
    headers: Headers,
  ) {
    await this.isAdmin(headers);

    await validateOrReject(createFuncionarioDto);

    const funcionario = await this.prisma.funcionario.create({
      data: {
        nome: createFuncionarioDto.nome,
        email: createFuncionarioDto.email,
        horarios: {
          create: createFuncionarioDto.horarios?.map((horario: HorarioDto) => {
            return {
              diaSemana: horario.diaSemana,
              startTime: horario.startTime,
              endTime: horario.endTime,
              breakStart: horario.breakStart ?? "",
              breakEnd: horario.breakEnd ?? "",
            };
          }),
        },
      },
    });
    return {
      message: "Funcionário criado com sucesso",
      data: funcionario,
    };
  }

  async findAll(headers: Headers) {
    await this.isAdmin(headers);

    const funcionario = await this.prisma.funcionario.findMany({
      include: {
        indisponibilidades: true,
        horarios: {
          orderBy: {
            diaSemana: "asc",
          },
        },
      },
    });

    return {
      message: "Funcionário criado com sucesso",
      data: funcionario,
    };
  }

  async findOne(id: string, headers: Headers) {
    await this.isAdminOrFuncionario(headers);

    const funcionario = await this.prisma.funcionario.findUnique({
      where: {
        id,
      },
      include: {
        agendamentos: true,
        indisponibilidades: true,
        horarios: true,
      },
    });

    return {
      message: "Funcionário encontrado com sucesso",
      data: funcionario,
    };
  }

  async findHorariosFuncionarioById(id: string, headers: Headers) {
    await this.isAdminOrFuncionario(headers);
    const horarios = await this.prisma.horario.findMany({
      where: {
        funcionarioId: id,
      },
      orderBy: {
        diaSemana: "asc",
      },
      include: {
        funcionario: {
          include: {
            indisponibilidades: true,
          },
        },
      },
    });

    return {
      message: "Horários encontrados",
      data: horarios,
    };
  }

  async findHorariosIdByFuncionario(
    id: string,
    horarioId: string,
    headers: Headers,
  ) {
    await this.isAdminOrFuncionario(headers);
    const horarioByFuncionario = await this.prisma.horario.findMany({
      where: {
        funcionarioId: id,
        id: horarioId,
      },
      orderBy: {
        diaSemana: "asc",
      },
    });

    return horarioByFuncionario;
  }

  async updateFuncionarioById(
    funcionarioId: string,
    updateFuncionarioDto: UpdateFuncionarioDto,
    headers: Headers,
  ) {
    await this.isAdminOrFuncionario(headers);

    const updateData: any = {
      nome: updateFuncionarioDto.nome,
      email: updateFuncionarioDto.email,
    };

    if (updateFuncionarioDto.horarios) {
      await this.updateHorarios(funcionarioId, updateFuncionarioDto.horarios);
    }

    const funcionario = await this.prisma.funcionario.update({
      where: {
        id: funcionarioId,
      },
      data: updateData,
      include: {
        horarios: true,
      },
    });

    return {
      message: "Funcionário atualizado com sucesso",
      data: funcionario,
    };
  }

  async updateHorarioIdFuncionarioById(
    funcionarioId: string,
    horarioId: string,
    updateHorarioDto: HorarioDto,
    headers: Headers,
  ) {
    await this.isAdminOrFuncionario(headers);

    const isExisting = await this.prisma.horario.findUnique({
      where: {
        id: horarioId,
      },
    });

    if (!isExisting)
      throw new HttpException("Horario não existe.", HttpStatus.NOT_FOUND);

    const horario = await this.prisma.horario.update({
      where: {
        id: horarioId,
        funcionarioId: funcionarioId,
      },
      data: updateHorarioDto,
    });

    return { message: "This action updates a horario", data: horario };
  }

  async remove(id: string, headers: Headers) {
    await this.isAdmin(headers);

    return {
      message: `This action removes funcionario #${id}!`,
      data: [],
    };
  }

  async removeHorarioByID(id: string, headers: Headers, horarioId: string) {
    await this.isAdminOrFuncionario(headers);

    return {
      message: `This action removes horario #${horarioId} at funcionario #${id}!`,
      data: [],
    };
  }

  async createIndisponibilidadeFuncionario(
    id: string,
    indisponibilidade: IndisponibilidadeDto,
    headers: Headers,
  ) {
    await this.isAdmin(headers);

    const { dataInicio, dataFim } = indisponibilidade;
    if (!dataInicio || !dataFim)
      return new HttpException(
        "Não definido a data de início e fim",
        HttpStatus.BAD_REQUEST,
      );
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const horaInicio = inicio.toTimeString().split(" ")[0]; // pegar apenas HH:mm:ss
    const horaFim = fim.toTimeString().split(" ")[0]; // pegar apenas HH:mm:ss

    const funcionario = await this.prisma.funcionario.findFirst({
      where: {
        id: id,
      },
    });

    if (!funcionario)
      return new HttpException(
        "Funcionario não encontrado!",
        HttpStatus.BAD_REQUEST,
      );

    const existingIndisponibilidade =
      await this.prisma.indisponibilidade.findFirst({
        where: {
          dataInicio: inicio,
          dataFim: fim,
        },
      });
    if (existingIndisponibilidade)
      return new HttpException("Data já existe", HttpStatus.BAD_REQUEST);

    try {
      const criarIndisponibilidade = await this.prisma.indisponibilidade.create(
        {
          data: {
            dataInicio: inicio,
            dataFim: fim,
            funcionarioId: funcionario.id,
            inicio: horaInicio,
            fim: horaFim,
            motivo: indisponibilidade.motivo || "",
          },
        },
      );

      return criarIndisponibilidade;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "Erro ao cadastrar Indisponibilidade",
        },
        HttpStatus.BAD_REQUEST,
        { cause: error },
      );
    }
  }

  private async updateHorarios(id: string, horarios: HorarioDto[]) {
    for (const horario of horarios) {
      if (horario.id) {
        await this.prisma.horario.update({
          where: {
            id: horario.id,
          },
          data: {
            diaSemana: horario.diaSemana,
            startTime: horario.startTime,
            endTime: horario.endTime,
            breakStart: horario.breakStart ?? "",
            breakEnd: horario.breakEnd ?? "",
          },
        });
      } else {
        await this.prisma.horario.create({
          data: {
            funcionarioId: id,
            diaSemana: horario.diaSemana,
            startTime: horario.startTime,
            endTime: horario.endTime,
            breakStart: horario.breakStart ?? "",
            breakEnd: horario.breakEnd ?? "",
          },
        });
      }
    }
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
}
