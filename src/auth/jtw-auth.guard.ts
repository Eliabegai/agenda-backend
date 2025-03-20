import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { jwtConstants } from "./constants";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    try {
      const request = context.switchToHttp().getRequest();
      const token: string = request.headers.token;

      if (!token)
        throw new HttpException(
          "Token não encontrado!",
          HttpStatus.UNAUTHORIZED,
        );

      const invalidToken = await this.authService.isTokenInvalid(token);

      if (!invalidToken)
        throw new HttpException("Token inválido!", HttpStatus.UNAUTHORIZED);

      const decoded = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      if (decoded === "invalid token")
        throw new HttpException("Token Inválido", HttpStatus.UNAUTHORIZED);

      request.user = decoded;
      return true;
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.UNAUTHORIZED,
        { cause: error },
      );
    }
  }
}
