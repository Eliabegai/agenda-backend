import { PartialType } from "@nestjs/mapped-types";
import {
  CreateUserDto,
  HorarioDto,
  IndisponibilidadeDto,
} from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdateHorarioDto extends PartialType(HorarioDto) {}
export class UpdateindisponibilidadeDto extends PartialType(
  IndisponibilidadeDto,
) {}
