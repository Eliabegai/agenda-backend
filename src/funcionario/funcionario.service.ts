import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFuncionarioDto, HorarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { PrismaService } from 'src/prisma.service';
import { validateOrReject } from 'class-validator';

@Injectable()
export class FuncionarioService {
  constructor(private readonly prisma: PrismaService) {}

  async createFuncionario(
    createFuncionarioDto: CreateFuncionarioDto,
    headers: Headers,
  ) {
    const admin = headers['admin'];
    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: admin,
      },
    });

    if (!isAdmin) throw new HttpException('Sem Permissão!', HttpStatus.LOCKED);

    await validateOrReject(createFuncionarioDto);

    const funcionario = await this.prisma.funcionario.create({
      data: {
        nome: createFuncionarioDto.nome,
        email: createFuncionarioDto.email,
        horarios: {
          create: createFuncionarioDto.horarios?.map((horario: HorarioDto) => ({
            diaSemana: horario.diaSemana,
            startTime: horario.startTime,
            endTime: horario.endTime,
            breakStart: horario.breakStart ?? '',
            breakEnd: horario.breakEnd ?? '',
          })),
        },
      },
    });
    return {
      message: 'Funcionário criado com sucesso',
      data: funcionario,
    };
  }

  async findAll(headers: Headers) {
    await this.isAdmin(headers);

    const funcionario = await this.prisma.funcionario.findMany({
      include: {
        horarios: true,
      },
    });

    return {
      message: 'Funcionário criado com sucesso',
      data: funcionario,
    };
  }

  async findOne(id: number, headers: Headers) {
    await this.isAdminOrFuncionario(headers);

    const funcionario = await this.prisma.funcionario.findUnique({
      where: {
        id,
      },
      include: {
        horarios: true,
      },
    });

    return {
      message: 'Funcionário encontrado com sucesso',
      data: funcionario,
    };
  }

  async updateFuncionario(
    funcionarioId: number,
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
      message: 'Funcionário atualizado com sucesso',
      data: funcionario,
    };
  }

  async updateHorarios(id: number, horarios: HorarioDto[]) {
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
            breakStart: horario.breakStart ?? '',
            breakEnd: horario.breakEnd ?? '',
          },
        });
      } else {
        await this.prisma.horario.create({
          data: {
            funcionarioId: id,
            diaSemana: horario.diaSemana,
            startTime: horario.startTime,
            endTime: horario.endTime,
            breakStart: horario.breakStart ?? '',
            breakEnd: horario.breakEnd ?? '',
          },
        });
      }
    }
  }

  async findHorariosFuncionario(id: number, headers: Headers) {
    await this.isAdminOrFuncionario(headers);
    const horarios = await this.prisma.horario.findMany({
      where: {
        funcionarioId: id,
      },
    });

    return {
      message: 'Horários encontrados',
      data: horarios,
    };
  }

  async findHorariosByFuncionario(
    id: number,
    horarioId: number,
    headers: Headers,
  ) {
    await this.isAdminOrFuncionario(headers);
    const horarioByFuncionario = await this.prisma.horario.findMany({
      where: {
        funcionarioId: id,
        id: horarioId,
      },
    });

    return horarioByFuncionario;
  }

  async updateHorario(
    idFuncionario: number,
    updateFuncionarioDto: UpdateFuncionarioDto,
  ) {
    for (const horario of updateFuncionarioDto.horarios as HorarioDto[]) {
      const existingHorario = await this.prisma.horario.findFirst({
        where: {
          funcionarioId: idFuncionario,
          diaSemana: horario.diaSemana,
        },
      });

      if (existingHorario) {
        // Atualizar horário existente
        await this.prisma.horario.update({
          where: {
            id: existingHorario.id,
          },
          data: {
            startTime: horario.startTime,
            endTime: horario.endTime,
            breakStart: horario.breakStart ?? '',
            breakEnd: horario.breakEnd ?? '',
          },
        });
      } else {
        // Adicionar novo horário
        await this.prisma.horario.create({
          data: {
            funcionarioId: idFuncionario,
            diaSemana: horario.diaSemana,
            startTime: horario.startTime,
            endTime: horario.endTime,
            breakStart: horario.breakStart ?? '',
            breakEnd: horario.breakEnd ?? '',
          },
        });
      }
    }

    const updatedHorarios = await this.prisma.horario.findMany({
      where: {
        funcionarioId: idFuncionario,
      },
    });

    return {
      message: 'Horários atualizados com sucesso',
      data: updatedHorarios,
    };
  }

  async updateHorarioById(
    funcionarioId: number,
    horarioId: number,
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
      throw new HttpException('Horario não existe.', HttpStatus.NOT_FOUND);

    const horario = await this.prisma.horario.update({
      where: {
        id: horarioId,
        funcionarioId: funcionarioId,
      },
      data: updateHorarioDto,
    });

    return { message: 'This action updates a horario', data: horario };
  }

  async remove(id: number, adminEmail: string, headers: Headers) {
    await this.isAdminOrFuncionario(headers);

    return `This action removes a #${id} funcionario`;
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
      throw new HttpException('Sem Permissão!', HttpStatus.LOCKED);

    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!isAdmin) throw new HttpException('Sem Permissão!', HttpStatus.LOCKED);
  }
}
