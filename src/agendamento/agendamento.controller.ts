import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AgendamentoService } from "./agendamento.service";
import { CreateAgendamentoDto } from "./dto/create-agendamento.dto";
import { UpdateAgendamentoDto } from "./dto/update-agendamento.dto";

@Controller("agendamento")
export class AgendamentoController {
  constructor(private readonly agendamentoService: AgendamentoService) {}

  @Post()
  create(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentoService.create(createAgendamentoDto);
  }

  @Get()
  findAll(@Headers() headers: Headers) {
    return this.agendamentoService.findAll(headers);
  }

  @Get("filter")
  findAgendamentoByRangeTime(
    @Query("start") start: string,
    @Query("end") end: string,
  ) {
    if (!start) {
      return new HttpException(
        'Os parâmetros "start" são obrigatórios.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.agendamentoService.findAgendamentoByRangeTime(start, end);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Headers() headers: Headers) {
    return this.agendamentoService.findOne(+id, headers);
  }

  @Patch(":id/func")
  updateFuncionario(
    @Param("id") id: string,
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
    @Headers() headers: Headers,
  ) {
    return this.agendamentoService.updateFuncionarioAgendamento(
      +id,
      updateAgendamentoDto,
      headers,
    );
  }

  @Patch(":id/date")
  updateDate(
    @Param("id") id: string,
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
    @Headers() headers: Headers,
  ) {
    return this.agendamentoService.updateDateAgendamento(
      +id,
      updateAgendamentoDto,
      headers,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Headers() headers: Headers) {
    return this.agendamentoService.remove(+id, headers);
  }
}
