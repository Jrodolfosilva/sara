-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "cnpj" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_cnpj_key" ON "Listing"("cnpj");
