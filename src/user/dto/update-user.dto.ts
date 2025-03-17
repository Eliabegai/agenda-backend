import { PartialType } from "@nestjs/mapped-types";
import {
  CreateUserDto,
  HorarioDto,
  IndisponibilidadeDto,
} from "./create-user.dto";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  novaSenha: string;
}
export class UpdateHorarioDto extends PartialType(HorarioDto) {}
export class UpdateindisponibilidadeDto extends PartialType(
  IndisponibilidadeDto,
) {}
