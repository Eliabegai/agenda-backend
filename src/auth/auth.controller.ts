import { Body, Controller, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";

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
}
