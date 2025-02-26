import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class CreateAdminDto {
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  senha: string;
}
