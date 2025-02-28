import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { CreateAuthDto } from "./dto/create-auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, senha: string) {
    const user = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!user) return null;

    const isMatch = await bcrypt.compare(senha, user.senha);

    if (!isMatch) return null;

    return user;
  }

  async login(user: CreateAuthDto) {
    const { email, senha } = user;

    const validUser = await this.validateUser(email, senha);

    if (!validUser)
      return new HttpException(
        "Usuário ou Senha não confere",
        HttpStatus.UNAUTHORIZED,
      );

    const payload = { username: validUser?.email, sub: validUser?.id };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }

  async logout(token: string) {
    await this.prisma.invalidToken.create({
      data: { token },
    });

    return {
      message: "Volte sempre!",
      status: HttpStatus.OK,
    };
  }

  async isTokenInvalid(token: string) {
    const invalidToken = await this.prisma.invalidToken.findUnique({
      where: {
        token,
      },
    });

    return !invalidToken;
  }
}
