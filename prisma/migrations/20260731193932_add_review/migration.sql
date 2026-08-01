-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "professionalId" TEXT,
    "authorId" TEXT NOT NULL,
    "estrelas" INTEGER NOT NULL,
    "depoimento" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_listingId_idx" ON "Review"("listingId");

-- CreateIndex
CREATE INDEX "Review_professionalId_idx" ON "Review"("professionalId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_listingId_key" ON "Review"("authorId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_professionalId_key" ON "Review"("authorId", "professionalId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
