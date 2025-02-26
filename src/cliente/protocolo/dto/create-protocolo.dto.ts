import { IsString } from "class-validator";

export class CreateProtocoloDto {
  @IsString()
  codigo: string;
}
