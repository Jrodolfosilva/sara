ALTER TABLE "Professional" ADD COLUMN "cpfHash" TEXT NOT NULL;

CREATE UNIQUE INDEX "Professional_cpfHash_key" ON "Professional"("cpfHash");
