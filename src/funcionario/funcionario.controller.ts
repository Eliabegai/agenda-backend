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
import { FuncionarioService } from './funcionario.service';
import { CreateFuncionarioDto, HorarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Controller('funcionario')
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) {}

  @Post()
  create(@Body() createFuncionarioDto: CreateFuncionarioDto) {
    return this.funcionarioService.createFuncionario(createFuncionarioDto);
  }

  @Get()
  findAll() {
    return this.funcionarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funcionarioService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFuncionarioDto: UpdateFuncionarioDto,
  ) {
    return this.funcionarioService.updateFuncionario(+id, updateFuncionarioDto);
  }

  @Get(':id/horario')
  findHorariosFuncionario(@Param('id') id: string) {
    return this.funcionarioService.findHorariosFuncionario(+id);
  }

  @Get(':id/horario/:horarioId')
  findHorariosByFuncionario(
    @Param('id') id: string,
    @Param('horarioId') horarioId: string,
  ) {
    return this.funcionarioService.findHorariosByFuncionario(+id, +horarioId);
  }

  @Patch(':id/horario/:horarioId')
  updateHorario(
    @Param('id') idFuncionario: string,
    @Param('horarioId') horarioId: string,
    @Body() updateHorarioDto: HorarioDto,
    @Headers() headers: Headers,
  ) {
    return this.funcionarioService.updateHorarioById(
      +idFuncionario,
      +horarioId,
      updateHorarioDto,
      headers,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Body() createFuncionarioDto: CreateFuncionarioDto,
  ) {
    return this.funcionarioService.remove(+id, createFuncionarioDto.adminEmail);
  }
}
