-- AlterTable
ALTER TABLE "conductores" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "rol" TEXT NOT NULL DEFAULT 'pasajero';
