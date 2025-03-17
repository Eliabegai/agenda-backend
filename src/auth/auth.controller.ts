import { Body, Controller, Headers, Post, Put, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { CreateUserDto } from "src/user/dto/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() user: CreateAuthDto) {
    return this.authService.login(user);
  }

  @Post("logout")
  logout(@Headers() headers: Headers) {
    const token: string = headers["token"];
    return this.authService.logout(token);
  }

  @Put("update-senha")
  alterarSenhaAdmin(
    @Headers() headers: Headers,
    @Body() updateSenha: UpdateAuthDto,
  ) {
    const email: string = headers["email"];
    return this.authService.alterarSenha(updateSenha, email);
  }

  @Post("reset-password")
  async resetPassword(
    @Body("newPassword") newPassword: string,
    @Query("token") token: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Post("forgot-password")
  async forgotPassword(@Body("email") email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post("register")
  async registerNovoUsuario(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }
}
