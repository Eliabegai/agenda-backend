// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Headers,
//   UseGuards,
// } from "@nestjs/common";
// import { FuncionarioService } from "./funcionario.service";
// import {
//   CreateFuncionarioDto,
//   HorarioDto,
//   IndisponibilidadeDto,
// } from "./dto/create-funcionario.dto";
// import { UpdateFuncionarioDto } from "./dto/update-funcionario.dto";
// import { JwtAuthGuard } from "src/auth/jtw-auth.guard";

// @UseGuards(JwtAuthGuard)
// @Controller("funcionario")
// export class FuncionarioController {
//   constructor(private readonly funcionarioService: FuncionarioService) {}

//   @Post()
//   createFuncionario(
//     @Body() createFuncionarioDto: CreateFuncionarioDto,
//     @Headers() headers: Headers,
//   ) {
//     return this.funcionarioService.createFuncionario(
//       createFuncionarioDto,
//       headers,
//     );
//   }

//   @Post(":id/indisponibilidade")
//   createIndisponibilidadeFuncionario(
//     @Param("id") id: string,
//     @Body() indisponibilidadeDto: IndisponibilidadeDto,
//     @Headers() headers: Headers,
//   ) {
//     return this.funcionarioService.createIndisponibilidadeFuncionario(
//       id,
//       indisponibilidadeDto,
//       headers,
//     );
//   }

//   @Get()
//   findAll(@Headers() headers: Headers) {
//     return this.funcionarioService.findAll(headers);
//   }

//   @Get(":id")
//   findOne(@Param("id") id: string, @Headers() headers: Headers) {
//     return this.funcionarioService.findOne(id, headers);
//   }

//   @Get(":id/horario")
//   findHorariosFuncionarioById(
//     @Param("id") id: string,
//     @Headers() headers: Headers,
//   ) {
//     return this.funcionarioService.findHorariosFuncionarioById(id, headers);
//   }

//   @Get(":id/horario/:horarioId")
//   findHorariosIdByFuncionario(
//     @Param("id") id: string,
//     @Param("horarioId") horarioId: string,
//     @Headers() headers: Headers,
//   ) {
//     return this.funcionarioService.findHorariosIdByFuncionario(
//       id,
//       horarioId,
//       headers,
//     );
//   }

//   @Patch(":id")
//   updateFuncionarioById(
//     @Param("id") id: string,
//     @Body() updateFuncionarioDto: UpdateFuncionarioDto,
//     @Headers() headers: Headers,
//   ) {
//     return this.funcionarioService.updateFuncionarioById(
//       id,
//       updateFuncionarioDto,
//       headers,
//     );
//   }

//   @Patch(":id/horario/:horarioId")
//   updateHorarioIdFuncionarioById(
//     @Param("id") idFuncionario: string,
//     @Param("horarioId") horarioId: string,
//     @Body() updateHorarioDto: HorarioDto,
//     @Headers() headers: Headers,
//   ) {
//     return this.funcionarioService.updateHorarioIdFuncionarioById(
//       idFuncionario,
//       horarioId,
//       updateHorarioDto,
//       headers,
//     );
//   }

//   @Delete(":id")
//   remove(@Param("id") id: string, @Headers() headers: Headers) {
//     return this.funcionarioService.remove(id, headers);
//   }

//   @Delete(":id/horario/:horarioId")
//   removeHorarioByID(
//     @Param("id") id: string,
//     @Param("horarioId") horarioId: string,
//     @Headers() headers: Headers,
//   ) {
//     return this.funcionarioService.removeHorarioByID(id, headers, horarioId);
//   }
// }
