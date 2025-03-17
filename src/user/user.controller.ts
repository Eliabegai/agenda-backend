import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Patch,
  Body,
  Headers,
  Query,
  Post,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/auth/jtw-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { IndisponibilidadeDto } from "./dto/create-user.dto";

@UseGuards(JwtAuthGuard)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get("filter")
  findUserByNome(@Query("nome") nome: string, @Headers() headers: Headers) {
    return this.userService.findUserByNome(nome, headers);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Post(":id/indisponibilidade")
  funcionarioIndisponivel(
    @Param("id") id: string,
    @Body() indisponibilidadeDto: IndisponibilidadeDto,
  ) {
    return this.userService.funcionarioIndisponivel(id, indisponibilidadeDto);
  }

  @Patch(":id")
  updateUserById(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateFuncionarioById(id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }

  @Delete(":id/indisponibilidade/:idIndisp")
  removeIndisponibilidadeUser(
    @Param("id") id: string,
    @Param("idIndisp") idIndisp: string,
  ) {
    return this.userService.removeIndisponibilidadeUser(id, idIndisp);
  }

  @Delete("/horario/:id")
  removeHorarioUser(@Param("id") id: string) {
    return this.userService.removeHorarioUser(id);
  }
}
