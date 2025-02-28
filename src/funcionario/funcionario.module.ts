import { Module } from "@nestjs/common";
import { FuncionarioService } from "./funcionario.service";
import { FuncionarioController } from "./funcionario.controller";
import { PrismaService } from "src/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "src/auth/auth.module";

@Module({
  controllers: [FuncionarioController],
  providers: [FuncionarioService, PrismaService, JwtService],
  imports: [AuthModule],
})
export class FuncionarioModule {}
