import { PartialType } from "@nestjs/mapped-types";
import { CreateAuthDto } from "./create-auth.dto";
import { IsString, MinLength } from "class-validator";

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsString()
  senhaAntiga: string;

  @IsString()
  @MinLength(6)
  novaSenha: string;
}
