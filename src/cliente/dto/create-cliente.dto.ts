import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  nome: string;

  @IsString()
  telefone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  protocolo: string;
}
