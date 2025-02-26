import { Module } from "@nestjs/common";
import { AgendamentoService } from "./agendamento.service";
import { AgendamentoController } from "./agendamento.controller";
import { PrismaService } from "src/prisma.service";
import { ClienteService } from "src/cliente/cliente.service";
import { ProtocoloService } from "src/cliente/protocolo/protocolo.service";

@Module({
  controllers: [AgendamentoController],
  providers: [
    AgendamentoService,
    PrismaService,
    ClienteService,
    ProtocoloService,
  ],
})
export class AgendamentoModule {}
