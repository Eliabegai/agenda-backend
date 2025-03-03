import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { HorarioDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        role: true,
        nome: true,
        email: true,
        agendamentos: true,
        indisponibilidades: true,
        horarios: true,
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

    // const user = await this.prisma.user.findMany({
    //   where: {
    //     nome: {
    //       contains: nome,
    //       mode: "insensitive",
    //     },
    //   },
    //   select: {
    //     id: true,
    //     nome: true,
    //     email: true,
    //   },
    // });

    const getUser = await this.prisma.$queryRaw`
      SELECT id, nome, email FROM "User" 
        WHERE unaccent(nome) ILIKE unaccent(${`%${nome}%`})
    `;

    return {
      message: `find user by nome: ${nome}`,
      getUser,
    };
  }

  async updateFuncionarioById(
    id: string,
    updateUserDto: UpdateUserDto,
    headers: Headers,
  ) {
    await this.isAdmin(headers);

    const { email, nome, role, horarios } = updateUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      return new HttpException(
        "Usuário não encontrado",
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateData = {
      nome: nome,
      email: email,
      role: role,
    };

    if (horarios) {
      await this.updateHorarios(id, horarios);
    }

    const updateUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        horarios: true,
      },
    });

    return {
      message: "Funcionário atualizado com sucesso",
      data: updateUser,
      status: HttpStatus.OK,
    };
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
