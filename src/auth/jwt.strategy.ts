import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as PassportJwtStrategy } from "passport-jwt";
import { AuthService } from "./auth.service";
import { ExtractJwt } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_JWT,
    });
  }

  validate(payload: any) {
    console.log("payload", payload);
    return { userId: payload.sub, username: payload.username };
  }
}
