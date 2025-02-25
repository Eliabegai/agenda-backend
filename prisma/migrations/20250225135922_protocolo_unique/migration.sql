/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Protocolo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Protocolo_clienteId_codigo_key";

-- CreateIndex
CREATE UNIQUE INDEX "Protocolo_codigo_key" ON "Protocolo"("codigo");
