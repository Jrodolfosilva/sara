ALTER TABLE "City" ADD COLUMN "slug" TEXT;

CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");
