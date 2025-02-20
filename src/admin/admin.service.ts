import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma.service';
import { validateOrReject } from 'class-validator';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    await validateOrReject(createAdminDto);

    const existingAdmin = await this.prisma.admin.findUnique({
      where: {
        email: createAdminDto.email,
      },
    });

    if (existingAdmin) {
      throw new ConflictException('Administrador com este email já existe');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.senha, 10);
    const user = await this.prisma.admin.create({
      data: {
        ...createAdminDto,
        senha: hashedPassword,
      },
    });
    return user;
  }

  findAll() {
    const users = this.prisma.admin.findMany();
    return users;
  }

  findOne(id: number) {
    const userById = this.prisma.admin.findUnique({
      where: {
        id: id,
      },
    });
    return userById;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    await validateOrReject(updateAdminDto);
    if (updateAdminDto.senha) {
      updateAdminDto.senha = await bcrypt.hash(updateAdminDto.senha, 10);
    }
    const updateUser = this.prisma.admin.update({
      where: {
        id: id,
      },
      data: updateAdminDto,
    });
    return updateUser;
  }

  remove(id: number) {
    const deleteUser = this.prisma.admin.delete({
      where: {
        id: id,
      },
    });
    return deleteUser;
  }
}
