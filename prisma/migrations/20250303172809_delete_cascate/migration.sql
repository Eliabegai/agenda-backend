-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_protocoloId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_userId_fkey";

-- DropForeignKey
ALTER TABLE "Protocolo" DROP CONSTRAINT "Protocolo_clienteId_fkey";

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_protocoloId_fkey" FOREIGN KEY ("protocoloId") REFERENCES "Protocolo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protocolo" ADD CONSTRAINT "Protocolo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
