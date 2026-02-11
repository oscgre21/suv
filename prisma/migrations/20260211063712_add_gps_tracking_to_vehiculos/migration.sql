-- AlterTable
ALTER TABLE "vehiculos" ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "ultimaActualizacion" TIMESTAMP(3),
ADD COLUMN     "velocidad" DOUBLE PRECISION DEFAULT 0;
