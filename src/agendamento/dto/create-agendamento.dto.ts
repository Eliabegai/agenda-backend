import { IsDateString, IsOptional, IsEnum, IsString } from "class-validator";
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
  @IsEnum(StatusAgendamento)
  status?: StatusAgendamento;

  Cliente: CreateClienteDto;

  @IsOptional()
  @IsString()
  funcionarioId?: string;
}
