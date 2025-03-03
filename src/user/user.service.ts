import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        _count: true,
        agendamentos: true,
        horarios: true,
      },
    });
    return { data: users, count: users.length };
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
