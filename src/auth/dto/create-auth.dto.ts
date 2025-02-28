import { IsOptional, IsString } from "class-validator";

export class CreateAuthDto {
  @IsString()
  email: string;

  @IsString()
  senha: string;

  @IsOptional()
  @IsString()
  id?: string;
}
