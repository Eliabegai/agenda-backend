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
} from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/auth/jtw-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";

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

  @Patch(":id")
  updateUserById(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Headers() headers: Headers,
  ) {
    return this.userService.updateFuncionarioById(id, updateUserDto, headers);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
