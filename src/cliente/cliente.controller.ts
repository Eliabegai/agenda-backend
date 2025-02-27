import { Controller, Get, Headers } from "@nestjs/common";
import { ClienteService } from "./cliente.service";

@Controller("cliente")
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  findAll(@Headers() headers: Headers) {
    return this.clienteService.findAll(headers);
  }
}
