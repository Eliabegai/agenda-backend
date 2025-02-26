import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminModule } from "./admin/admin.module";
import { FuncionarioModule } from "./funcionario/funcionario.module";
import { AgendamentoModule } from "./agendamento/agendamento.module";
import { ClienteModule } from "./cliente/cliente.module";
import { ProtocoloModule } from "./cliente/protocolo/protocolo.module";

@Module({
  imports: [
    AdminModule,
    FuncionarioModule,
    AgendamentoModule,
    ClienteModule,
    ProtocoloModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
