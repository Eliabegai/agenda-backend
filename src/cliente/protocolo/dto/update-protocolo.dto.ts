import { PartialType } from "@nestjs/mapped-types";
import { CreateProtocoloDto } from "./create-protocolo.dto";

export class UpdateClienteDto extends PartialType(CreateProtocoloDto) {}
