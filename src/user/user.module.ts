import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaService } from "src/prisma.service";
import { JwtModule, JwtService } from "@nestjs/jwt";

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService],
  imports: [JwtModule],
})
export class UserModule {}
