import { Controller, Get, Headers, UseGuards } from "@nestjs/common";
import { ClienteService } from "./cliente.service";
import { JwtAuthGuard } from "src/auth/jtw-auth.guard";

@Controller("cliente")
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Headers() headers: Headers) {
    return this.clienteService.findAll(headers);
  }
}
