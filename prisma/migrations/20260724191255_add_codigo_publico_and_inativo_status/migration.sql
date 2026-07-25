-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'INATIVO';

-- AlterTable: Listing
ALTER TABLE "Listing" ADD COLUMN "codigoPublico" TEXT;
UPDATE "Listing" SET "codigoPublico" = 'EMP-' || upper(substr(md5(id), 1, 8));
ALTER TABLE "Listing" ALTER COLUMN "codigoPublico" SET NOT NULL;
CREATE UNIQUE INDEX "Listing_codigoPublico_key" ON "Listing"("codigoPublico");

-- AlterTable: Professional
ALTER TABLE "Professional" ADD COLUMN "codigoPublico" TEXT;
UPDATE "Professional" SET "codigoPublico" = 'PRO-' || upper(substr(md5(id), 1, 8));
ALTER TABLE "Professional" ALTER COLUMN "codigoPublico" SET NOT NULL;
CREATE UNIQUE INDEX "Professional_codigoPublico_key" ON "Professional"("codigoPublico");
