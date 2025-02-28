import { IsDateString, IsOptional, IsString } from "class-validator";
import { CreateClienteDto } from "src/cliente/dto/create-cliente.dto";

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
  @IsString()
  protocoloId: string;

  @IsDateString()
  dataHora: string;

  @IsOptional()
  status?: StatusAgendamento;

  Cliente: CreateClienteDto;

  @IsOptional()
  @IsString()
  userId?: string;
}
