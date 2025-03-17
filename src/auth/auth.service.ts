import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { randomUUID } from "crypto";
import { CreateUserDto, HorarioDto } from "src/user/dto/create-user.dto";
import { RoleUser } from "@prisma/client";
import { jwtConstants } from "./constants";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, senha: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const isMatch = await bcrypt.compare(senha, user?.senha);

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

    const payload = {
      username: validUser?.nome,
      id: validUser?.id,
      email: validUser.email,
      role: validUser.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret,
    });

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

  async alterarSenha(updateSenha: UpdateAuthDto, email: string) {
    const { senhaAntiga, novaSenha } = updateSenha;

    const usuario = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!usuario)
      return new HttpException(
        "Usuário não encontrado",
        HttpStatus.BAD_REQUEST,
      );

    const passwordMatches = bcrypt.compareSync(senhaAntiga, usuario?.senha);

    if (!passwordMatches)
      return new HttpException("Senhas não conferem!", HttpStatus.BAD_REQUEST);

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await this.prisma.user.update({
      where: { id: usuario.id },
      data: { senha: hashedPassword },
    });

    return { message: "Sennha Alterada com sucesso!", status: HttpStatus.OK };
  }

  async isTokenInvalid(token: string) {
    const invalidToken = await this.prisma.invalidToken.findUnique({
      where: {
        token,
      },
    });

    return !invalidToken;
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user)
      throw new HttpException("E-mail não encontrado!", HttpStatus.BAD_REQUEST);

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const url = "http://localhost:3000";

    await this.prisma.passwordResetToken.upsert({
      where: { id: user.id },
      update: { token, expiresAt },
      create: { userId: user.id, token, expiresAt },
    });

    // Simulação de envio de e-mail (substituir por serviço real)
    console.log(
      `Envie este link para o usuário: http://localhost:3000/auth/reset-password?token=${token}`,
    );

    return {
      message: "E-mail enviado para redefinição de senha!",
      link: `${url}/auth/reset-password?token=${token}`,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new HttpException(
        "Token Inválido ou expirado",
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        senha: hashedPassword,
      },
    });

    await this.prisma.passwordResetToken.delete({ where: { token } });

    return { message: "Senha redefinida com sucesso!" };
  }

  async registerUser(createUserDto: CreateUserDto) {
    const { email, senha, role, nome, horarios } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        "E-mail já está cadastrado",
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const horariosDefault: HorarioDto[] = [
      {
        diaSemana: 1,
        startTime: "10:00:00",
        endTime: "17:00:00",
        breakStart: "12:00:00",
        breakEnd: "13:00:00",
      },
      {
        diaSemana: 2,
        startTime: "10:00:00",
        endTime: "17:00:00",
        breakStart: "12:00:00",
        breakEnd: "13:00:00",
      },
      {
        diaSemana: 3,
        startTime: "10:00:00",
        endTime: "17:00:00",
        breakStart: "12:00:00",
        breakEnd: "13:00:00",
      },
      {
        diaSemana: 4,
        startTime: "10:00:00",
        endTime: "17:00:00",
        breakStart: "12:00:00",
        breakEnd: "13:00:00",
      },
      {
        diaSemana: 5,
        startTime: "10:00:00",
        endTime: "17:00:00",
        breakStart: "12:00:00",
        breakEnd: "13:00:00",
      },
    ];

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          senha: hashedPassword,
          nome,
          role: (role as RoleUser) ?? RoleUser.USER, // Se não for passado, assume USER
        },
      });

      if (horarios && role === "USER") {
        await this.prisma.horario.createMany({
          data: horarios?.map((horario: HorarioDto) => {
            return {
              diaSemana: horario.diaSemana,
              startTime: horario.startTime,
              endTime: horario.endTime,
              breakStart: horario.breakStart ?? "",
              breakEnd: horario.breakEnd ?? "",
              userId: user.id,
            };
          }),
        });
      } else {
        await this.prisma.horario.createMany({
          data: horariosDefault?.map((horario: HorarioDto) => {
            return {
              diaSemana: horario.diaSemana,
              startTime: horario.startTime,
              endTime: horario.endTime,
              breakStart: horario.breakStart ?? "",
              breakEnd: horario.breakEnd ?? "",
              userId: user.id,
            };
          }),
        });
      }

      const payload = {
        username: user?.nome,
        email: user?.email,
        id: user?.id,
        role: user?.role,
      };
      const token = this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
      });

      return {
        message: "Usuário criado com sucesso",
        user,
        accessToken: token,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { status: HttpStatus, error: error.message },
        HttpStatus.BAD_REQUEST,
        { cause: error },
      );
    }
  }
}
