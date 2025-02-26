import { Module } from "@nestjs/common";
import { ProtocoloController } from "./protocolo.controller";
import { ProtocoloService } from "./protocolo.service";
import { PrismaService } from "src/prisma.service";

@Module({
  controllers: [ProtocoloController],
  providers: [ProtocoloService, PrismaService],
})
export class ProtocoloModule {}
