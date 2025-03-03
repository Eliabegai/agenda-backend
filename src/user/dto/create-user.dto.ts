import { RoleUser } from "@prisma/client";
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsInt,
  IsArray,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  senha: string;

  @IsOptional()
  role?: RoleUser;

  @IsOptional()
  @IsArray()
  horarios?: HorarioDto[];
}

export class HorarioDto {
  @IsNotEmpty()
  @IsInt()
  diaSemana: number;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  breakStart?: string;

  @IsOptional()
  @IsString()
  breakEnd?: string;
}

export class IndisponibilidadeDto {
  @IsOptional()
  @IsDateString()
  dataInicio?: Date;

  @IsOptional()
  @IsDateString()
  dataFim?: Date;

  @IsOptional()
  @IsString()
  motivo?: string;
}
