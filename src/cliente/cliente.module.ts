import { Module } from "@nestjs/common";
import { ClienteService } from "./cliente.service";
import { ClienteController } from "./cliente.controller";
import { PrismaService } from "src/prisma.service";
import { AgendamentoService } from "src/agendamento/agendamento.service";
import { ProtocoloService } from "./protocolo/protocolo.service";
import { AuthModule } from "src/auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [ClienteController],
  providers: [
    ClienteService,
    PrismaService,
    AgendamentoService,
    ProtocoloService,
    JwtService,
  ],
  imports: [AuthModule],
})
export class ClienteModule {}
