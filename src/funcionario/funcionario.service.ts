import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFuncionarioDto, HorarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { PrismaService } from 'src/prisma.service';
import { validateOrReject } from 'class-validator';

@Injectable()
export class FuncionarioService {
  constructor(private readonly prisma: PrismaService) {}

  async createFuncionario(createFuncionarioDto: CreateFuncionarioDto) {
    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: createFuncionarioDto.adminEmail,
      },
    });

    if (!isAdmin)
      throw new NotFoundException('Não tem permissão de administrador');

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
      data: await funcionario,
    };
  }

  async findAll() {
    const funcionario = await this.prisma.funcionario.findMany({
      include: {
        horarios: true,
      },
    });

    return {
      message: 'Funcionário criado com sucesso',
      data: await funcionario,
    };
  }

  async findOne(id: number) {
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
      data: await funcionario,
    };
  }

  async update(id: number, updateFuncionarioDto: UpdateFuncionarioDto) {
    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: updateFuncionarioDto.adminEmail,
      },
    });

    if (!isAdmin)
      throw new NotFoundException('Não tem permissão de administrador');

    const updateData: any = {
      nome: updateFuncionarioDto.nome,
      email: updateFuncionarioDto.email,
    };

    if (updateFuncionarioDto.horarios) {
      updateData.horarios = {
        create: updateFuncionarioDto.horarios.map((horario: HorarioDto) => ({
          diaSemana: horario.diaSemana,
          startTime: horario.startTime,
          endTime: horario.endTime,
          breakStart: horario.breakStart ?? '',
          breakEnd: horario.breakEnd ?? '',
        })),
      };
    }

    const funcionario = await this.prisma.funcionario.update({
      where: {
        id,
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

  async findHorariosByFuncionario(id: number, horarioId: number) {
    const horarioByFuncionario = await this.prisma.horario.findMany({
      where: {
        funcionarioId: id,
        id: horarioId,
      },
    });

    return horarioByFuncionario;
  }

  updateHorario(
    id: number,
    horarioId: number,
    // updateFuncionarioDto: UpdateFuncionarioDto,
  ) {
    return `Atualizar Horario ${horarioId} do funcionario ${id}`;
  }

  async remove(id: number, adminEmail: string) {
    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!isAdmin)
      throw new NotFoundException('Não tem permissão de administrador');

    return `This action removes a #${id} funcionario`;
  }
}
