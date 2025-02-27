/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Agendamento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Cliente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Funcionario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Horario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Indisponibilidade` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Protocolo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_funcionarioId_fkey";

-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_protocoloId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_funcionarioId_fkey";

-- DropForeignKey
ALTER TABLE "Indisponibilidade" DROP CONSTRAINT "Indisponibilidade_funcionarioId_fkey";

-- DropForeignKey
ALTER TABLE "Protocolo" DROP CONSTRAINT "Protocolo_clienteId_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Admin_id_seq";

-- AlterTable
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "funcionarioId" SET DATA TYPE TEXT,
ALTER COLUMN "protocoloId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Agendamento_id_seq";

-- AlterTable
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Cliente_id_seq";

-- AlterTable
ALTER TABLE "Funcionario" DROP CONSTRAINT "Funcionario_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Funcionario_id_seq";

-- AlterTable
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "funcionarioId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Horario_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Horario_id_seq";

-- AlterTable
ALTER TABLE "Indisponibilidade" DROP CONSTRAINT "Indisponibilidade_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "funcionarioId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Indisponibilidade_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Indisponibilidade_id_seq";

-- AlterTable
ALTER TABLE "Protocolo" DROP CONSTRAINT "Protocolo_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "clienteId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Protocolo_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Protocolo_id_seq";

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_protocoloId_fkey" FOREIGN KEY ("protocoloId") REFERENCES "Protocolo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protocolo" ADD CONSTRAINT "Protocolo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indisponibilidade" ADD CONSTRAINT "Indisponibilidade_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
