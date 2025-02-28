import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminModule } from "./admin/admin.module";
import { FuncionarioModule } from "./funcionario/funcionario.module";
import { AgendamentoModule } from "./agendamento/agendamento.module";
import { ClienteModule } from "./cliente/cliente.module";
import { ProtocoloModule } from "./cliente/protocolo/protocolo.module";
import { AuthModule } from "./auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    AdminModule,
    FuncionarioModule,
    AgendamentoModule,
    ClienteModule,
    ProtocoloModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
