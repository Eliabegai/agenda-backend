import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProtocoloService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() {
    const protocolos = await this.prisma.protocolo.findMany({});
    return {
      message: 'Returns protocolos',
      data: protocolos,
    };
  }

  async createOrReturnProtocolo(codigo: string, clienteId: number) {
    const existingProtocolo = await this.prisma.protocolo.findFirst({
      where: {
        codigo: codigo,
        clienteId: clienteId,
      },
    });

    if (!existingProtocolo) {
      const protocolo = await this.prisma.protocolo.create({
        data: {
          codigo: codigo,
          clienteId: clienteId,
        },
      });

      return protocolo;
    }
    return existingProtocolo;
  }
}
