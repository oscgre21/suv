/*
  Warnings:

  - Made the column `password` on table `usuarios` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "password" SET NOT NULL;

-- AlterTable
ALTER TABLE "vehiculos" ADD COLUMN     "pasajerosABordo" INTEGER DEFAULT 0;
