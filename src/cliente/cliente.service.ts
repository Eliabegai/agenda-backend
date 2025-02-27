import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { PrismaService } from "src/prisma.service";
import { ProtocoloService } from "./protocolo/protocolo.service";

@Injectable()
export class ClienteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly protocoloService: ProtocoloService,
  ) {}

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

  async createCliente(createClienteDto: CreateClienteDto, headers: Headers) {
    await this.isAdminOrFuncionario(headers);
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

  async createProtocoloToCliente(
    codigo: string,
    clienteId: string,
    headers: Headers,
  ) {
    await this.isAdminOrFuncionario(headers);
    return await this.protocoloService.createOrReturnProtocolo(
      codigo,
      clienteId,
    );
  }

  async findAll(headers: Headers) {
    await this.isAdminOrFuncionario(headers);
    const findCliente = await this.prisma.cliente.findMany({
      include: {
        protocolos: true,
      },
    });
    return { message: `This action returns all cliente`, data: findCliente };
  }

  private async isAdminOrFuncionario(headers: Headers) {
    const adminEmail = headers["admin"] || "";
    const funcionarioEmail = headers["funcionario"] || "";

    if (!adminEmail && !funcionarioEmail)
      throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);

    const isAdmin = await this.prisma.admin.findUnique({
      where: {
        email: adminEmail,
      },
    });

    const isFuncionario = await this.prisma.funcionario.findUnique({
      where: {
        email: funcionarioEmail,
      },
    });

    if (!isAdmin && !isFuncionario)
      throw new HttpException("Sem Permissão!", HttpStatus.LOCKED);
  }
}
