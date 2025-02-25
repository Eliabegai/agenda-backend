import { Controller, Get } from '@nestjs/common';
import { ProtocoloService } from './protocolo.service';

@Controller('protocolo')
export class ProtocoloController {
  constructor(private readonly protocoloService: ProtocoloService) {}

  @Get()
  findAll() {
    return this.protocoloService.findAll();
  }
}
