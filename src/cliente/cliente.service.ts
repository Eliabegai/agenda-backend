import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { UpdateClienteDto } from "./dto/update-cliente.dto";
import { PrismaService } from "src/prisma.service";
import { ProtocoloService } from "./protocolo/protocolo.service";

@Injectable()
export class ClienteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly protocoloService: ProtocoloService,
  ) {}

  create(createClienteDto: CreateClienteDto) {
    return {
      cliente: "This action adds a new cliente",
    };
  }

  async createOrReturnCliente(createClienteDto: CreateClienteDto) {
    const existingCliente = await this.prisma.cliente.findFirst({
      where: {
        email: createClienteDto.email,
      },
    });

    if (!existingCliente) {
      const cliente = await this.prisma.cliente.create({
        data: {
          nome: createClienteDto.nome,
          email: createClienteDto.email,
          telefone: createClienteDto.telefone,
        },
      });

      return cliente;
    }

    return existingCliente;
  }

  async createCliente(createClienteDto: CreateClienteDto) {
    const existingCliente = await this.prisma.cliente.findFirst({
      where: {
        email: createClienteDto.email,
      },
    });

    if (!existingCliente) {
      const newCliente = await this.prisma.cliente.create({
        data: {
          nome: createClienteDto.nome,
          telefone: createClienteDto.telefone,
          email: createClienteDto.email,
        },
      });

      const clienteId = newCliente.id;

      const protocolo = await this.protocoloService.createOrReturnProtocolo(
        createClienteDto.protocolo,
        clienteId,
      );
      return protocolo;
    } else {
      const protocolo = await this.protocoloService.createOrReturnProtocolo(
        createClienteDto.protocolo,
        existingCliente.id,
      );

      return protocolo;
    }
  }

  async createProtocoloToCliente(codigo: string, clienteId: number) {
    return await this.protocoloService.createOrReturnProtocolo(
      codigo,
      clienteId,
    );
  }

  async findAll() {
    const findCliente = await this.prisma.cliente.findMany({
      include: {
        protocolos: true,
      },
    });
    return { message: `This action returns all cliente`, data: findCliente };
  }

  findOne(id: number) {
    return `This action returns a #${id} cliente`;
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    return `This action updates a #${id} cliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} cliente`;
  }
}
