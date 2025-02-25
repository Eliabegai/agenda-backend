import { IsInt, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { CreateClienteDto } from 'src/cliente/dto/create-cliente.dto';

export enum StatusAgendamento {
  AGENDADO,
  CANCELADO,
  NAO_COMPARECEU,
  ENCERRADO,
  EMITIDO,
  REAGENDADO,
  REAGENDAR,
}
export class CreateAgendamentoDto {
  @IsInt()
  protocoloId: number;

  @IsDateString()
  dataHora: string;

  @IsOptional()
  @IsEnum(StatusAgendamento)
  status?: StatusAgendamento;

  Cliente: CreateClienteDto;
}
