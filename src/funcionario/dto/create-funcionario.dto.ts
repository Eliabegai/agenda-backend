import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFuncionarioDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEmail()
  adminEmail: string;

  @IsOptional()
  @IsArray()
  horarios?: HorarioDto[];
}

export class HorarioDto {
  @IsOptional()
  id: number;

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
