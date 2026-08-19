-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "professionalId" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" TEXT,
    "imagemUrl" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_listingId_idx" ON "Product"("listingId");

-- CreateIndex
CREATE INDEX "Product_professionalId_idx" ON "Product"("professionalId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
