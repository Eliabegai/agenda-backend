import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { HorarioDto, IndisponibilidadeDto } from "./dto/create-user.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        NOT: {
          role: "ADMIN",
        },
      },
      select: {
        id: true,
        role: true,
        nome: true,
        email: true,
        agendamentos: true,
        indisponibilidades: true,
        horarios: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
    return { data: users, count: users.length };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        horarios: {
          orderBy: {
            diaSemana: "asc",
          },
        },
        agendamentos: true,
        indisponibilidades: true,
      },
      omit: {
        senha: true,
        atualizadoEm: true,
        criadoEm: true,
        passwordResetTokenId: true,
      },
    });
    if (!user)
      return new HttpException(
        "Funcionário não encontrado ou não existe!",
        HttpStatus.BAD_REQUEST,
      );

    return {
      message: "Funcionário encontrado com sucesso",
      data: user,
      status: HttpStatus.OK,
    };
  }

  async findUserByNome(nome: string, headers: Headers) {
    await this.isAdmin(headers);

    try {
      // const getUser = await this.prisma.$queryRaw`
      //   SELECT
      //     u.id,
      //     u.nome,
      //     u.email,
      //     h.horarios,           -- Traz todas as colunas de horario
      //     i.indisponibilidades, -- Traz todas as colunas de indisponibilidade
      //     a.agendamentos        -- Traz todas as colunas de agendamento
      //   FROM "User" u
      //   LEFT JOIN "Horario" h ON h.userId = u.id
      //   LEFT JOIN "Indisponibilidade" i ON i.userId = u.id
      //   LEFT JOIN "Agendamento" a ON a.userId = u.id
      //   WHERE unaccent(u.nome) ILIKE unaccent(${`%${nome}%`})
      // `;
      const getUser = await this.prisma.user.findMany({
        where: {
          nome: {
            contains: nome,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          nome: true,
          email: true,
          horarios: true, // Prisma já pega a relação correta
          indisponibilidades: true,
          agendamentos: true,
        },
        orderBy: {
          nome: "asc",
        },
      });

      return {
        data: getUser,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST,
        { cause: error },
      );
    }
  }

  async funcionarioIndisponivel(
    id: string,
    indisponibilidadeDto: IndisponibilidadeDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user)
      return new HttpException(
        "Funcionário não encontrado!",
        HttpStatus.BAD_REQUEST,
      );

    const { dataInicio, dataFim, motivo } = indisponibilidadeDto;

    if (!dataInicio || !dataFim)
      return new HttpException(
        "Não definido a data de início e fim",
        HttpStatus.BAD_REQUEST,
      );

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const horaInicio = inicio.toTimeString().split(" ")[0]; // pegar apenas HH:mm:ss
    const horaFim = fim.toTimeString().split(" ")[0]; // pegar apenas HH:mm:ss

    const existingIndisponibilidade =
      await this.prisma.indisponibilidade.findFirst({
        where: {
          dataInicio: inicio,
          dataFim: fim,
          userId: id,
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
            userId: id,
            inicio: horaInicio,
            fim: horaFim,
            motivo: motivo || "",
          },
        },
      );

      return criarIndisponibilidade;
    } catch (error) {
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

  async updateFuncionarioById(id: string, updateUserDto: UpdateUserDto) {
    const { email, nome, role, horarios, senha, novaSenha } = updateUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return new HttpException(
        "Usuário não encontrado",
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateData: any = {
      nome: nome,
      email: email,
      role: role,
    };

    // Verificação e atualização de senha
    if (senha || novaSenha) {
      if (!senha || !novaSenha) {
        throw new HttpException(
          "Para atualizar a senha, forneça tanto a senha atual quanto a nova senha",
          HttpStatus.BAD_REQUEST,
        );
      }

      const isPasswordValid = await bcrypt.compare(senha, existingUser.senha);

      if (horarios) {
        await this.updateHorarios(id, horarios);
      }

      if (!isPasswordValid) {
        throw new HttpException(
          "Senha atual incorreta",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const hashedNewPassword = await bcrypt.hash(novaSenha, 10);
      updateData.senha = hashedNewPassword;
    }

    if (horarios) {
      await this.updateHorarios(id, horarios);
    }

    try {
      const updateUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: { horarios: true },
      });

      return { data: updateUser };
    } catch (error) {
      throw new HttpException(
        "Erro ao atualizar usuário",
        HttpStatus.BAD_REQUEST,
        { cause: error },
      );
    }
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      return new HttpException(
        "Usuário não encontrado",
        HttpStatus.BAD_REQUEST,
      );
    }
    const removeUser = await this.prisma.user.delete({
      where: {
        id,
      },
    });
    return {
      message: `This action removes funcionario #${id}! **${removeUser?.nome}**`,
      data: removeUser,
      status: HttpStatus.OK,
    };
  }

  async removeHorarioUser(id: string) {
    const existingHorario = await this.prisma.horario.findUnique({
      where: { id },
    });
    if (!existingHorario) {
      return new HttpException(
        "Horário não encontrado",
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.prisma.horario.delete({
        where: {
          id,
        },
      });

      return {
        message: `Removido Horário ID ${id}`,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST,
        { cause: error },
      );
    }
  }

  async removeIndisponibilidadeUser(id: string, idIndisp: string) {
    const existingIndisponibilidade =
      await this.prisma.indisponibilidade.findUnique({
        where: { id: idIndisp, userId: id },
      });
    if (!existingIndisponibilidade) {
      return new HttpException(
        "Indisponibilidade não encontrada",
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.prisma.indisponibilidade.delete({
        where: {
          id: idIndisp,
        },
      });

      return {
        message: `Removido Indisponibilidade ID ${id}`,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST,
        { cause: error },
      );
    }
  }

  private async isAdmin(headers: Headers) {
    const adminEmail = headers["admin"] || "";

    if (!adminEmail)
      throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);

    const isAdmin = await this.prisma.user.findUnique({
      where: {
        email: adminEmail,
        role: "ADMIN",
      },
    });

    if (!isAdmin) throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);
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
            userId: id,
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
}
