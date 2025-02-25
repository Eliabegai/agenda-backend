import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { AgendamentoService } from './agendamento.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

@Controller('agendamento')
export class AgendamentoController {
  constructor(private readonly agendamentoService: AgendamentoService) {}

  @Post()
  create(
    @Body() createAgendamentoDto: CreateAgendamentoDto,
    @Headers() headers: Headers,
  ) {
    return this.agendamentoService.create(createAgendamentoDto, headers);
  }

  @Get()
  findAll(@Headers() headers: Headers) {
    return this.agendamentoService.findAll(headers);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers() headers: Headers) {
    return this.agendamentoService.findOne(+id, headers);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
    @Headers() headers: Headers,
  ) {
    return this.agendamentoService.update(+id, updateAgendamentoDto, headers);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers() headers: Headers) {
    return this.agendamentoService.remove(+id, headers);
  }
}
