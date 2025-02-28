/*
  Warnings:

  - You are about to drop the column `funcionarioId` on the `Agendamento` table. All the data in the column will be lost.
  - You are about to drop the column `funcionarioId` on the `Horario` table. All the data in the column will be lost.
  - You are about to drop the column `funcionarioId` on the `Indisponibilidade` table. All the data in the column will be lost.
  - You are about to drop the column `funcionarioId` on the `PasswordResetToken` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Funcionario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,dataHora]` on the table `Agendamento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `PasswordResetToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('ADMIN', 'USER');

-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_funcionarioId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_funcionarioId_fkey";

-- DropForeignKey
ALTER TABLE "Indisponibilidade" DROP CONSTRAINT "Indisponibilidade_funcionarioId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_funcionarioId_fkey";

-- DropIndex
DROP INDEX "Agendamento_funcionarioId_dataHora_key";

-- DropIndex
DROP INDEX "PasswordResetToken_funcionarioId_key";

-- AlterTable
ALTER TABLE "Agendamento" DROP COLUMN "funcionarioId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Horario" DROP COLUMN "funcionarioId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Indisponibilidade" DROP COLUMN "funcionarioId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP COLUMN "funcionarioId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Funcionario";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "RoleUser" NOT NULL DEFAULT 'USER',
    "passwordResetTokenId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agendamento_userId_dataHora_key" ON "Agendamento"("userId", "dataHora");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_userId_key" ON "PasswordResetToken"("userId");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indisponibilidade" ADD CONSTRAINT "Indisponibilidade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
