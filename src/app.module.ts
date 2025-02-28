import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AgendamentoModule } from "./agendamento/agendamento.module";
import { ClienteModule } from "./cliente/cliente.module";
import { ProtocoloModule } from "./cliente/protocolo/protocolo.module";
import { AuthModule } from "./auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    AgendamentoModule,
    ClienteModule,
    ProtocoloModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
