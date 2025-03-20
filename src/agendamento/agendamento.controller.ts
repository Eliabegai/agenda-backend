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
  UseGuards,
} from "@nestjs/common";
import { AgendamentoService } from "./agendamento.service";
import { CreateAgendamentoDto } from "./dto/create-agendamento.dto";
import { UpdateAgendamentoDto } from "./dto/update-agendamento.dto";
import { JwtAuthGuard } from "src/auth/jtw-auth.guard";
import { Public } from "src/auth/public.decorator";

@Controller("agendamento")
export class AgendamentoController {
  constructor(private readonly agendamentoService: AgendamentoService) {}

  @Post()
  create(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentoService.create(createAgendamentoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Headers() headers: Headers) {
    return this.agendamentoService.findAll(headers);
  }

  @Public()
  @Get("agenda")
  findAllAgendamentos(
    @Query("start") start: string,
    @Query("end") end: string,
  ) {
    if (!start) {
      return new HttpException(
        'Os parâmetros "start" são obrigatórios.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.agendamentoService.findAllAgendamentos(start, end);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @Headers() headers: Headers) {
    return this.agendamentoService.findOne(id, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/func")
  updateFuncionario(
    @Param("id") id: string,
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
    @Headers() headers: Headers,
  ) {
    return this.agendamentoService.updateFuncionarioAgendamento(
      id,
      updateAgendamentoDto,
      headers,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/date")
  updateDate(
    @Param("id") id: string,
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
    @Headers() headers: Headers,
  ) {
    return this.agendamentoService.updateDateAgendamento(
      id,
      updateAgendamentoDto,
      headers,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  removeAgendamento(@Param("id") id: string, @Headers() headers: Headers) {
    return this.agendamentoService.removeAgendamento(id, headers);
  }
}
