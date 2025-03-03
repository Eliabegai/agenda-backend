import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaService } from "src/prisma.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/auth.service";

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService, AuthService],
  imports: [JwtModule, AuthModule],
})
export class UserModule {}
