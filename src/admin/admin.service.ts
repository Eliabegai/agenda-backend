import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { PrismaService } from "src/prisma.service";
import { validateOrReject } from "class-validator";
import * as bcrypt from "bcryptjs";

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
      throw new ConflictException("Administrador com este email já existe");
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

  async findOne(id: number) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdmin) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const userById = this.prisma.admin.findUnique({
      where: {
        id: id,
      },
    });
    return userById;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdmin) {
      throw new NotFoundException("Usuário não encontrado");
    }

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

  async remove(id: number) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdmin) {
      throw new NotFoundException("Usuário não encontrado");
    }

    await this.prisma.admin.delete({
      where: {
        id: id,
      },
    });

    return {
      message: "Usuário deletado com sucesso!",
    };
  }
}
