-- AlterTable
ALTER TABLE "vehiculos" ADD COLUMN     "paradaActualId" TEXT;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_paradaActualId_fkey" FOREIGN KEY ("paradaActualId") REFERENCES "paradas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
