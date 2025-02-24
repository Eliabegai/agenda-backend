import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAgendamentoDto {
  @IsInt()
  funcionarioId: number;

  @IsInt()
  protocoloId: number;

  @IsDateString()
  dataHora: string;

  @IsOptional()
  @IsString()
  status?: string;
}
