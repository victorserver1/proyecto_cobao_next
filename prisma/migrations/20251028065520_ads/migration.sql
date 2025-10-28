-- CreateEnum
CREATE TYPE "AdsStatus" AS ENUM ('DRAFT', 'READY', 'PROCESSING', 'FAILED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Ads" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "duration" INTEGER,
    "url" TEXT NOT NULL,
    "filePath" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "status" "MusicStatus" NOT NULL DEFAULT 'READY',
    "errorMsg" TEXT,
    "thumbnail" TEXT,
    "youtubeUrl" TEXT,
    "youtubeId" TEXT,
    "ytdl" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ads_youtubeUrl_key" ON "Ads"("youtubeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Ads_youtubeId_key" ON "Ads"("youtubeId");

-- CreateIndex
CREATE INDEX "Ads_status_idx" ON "Ads"("status");

-- CreateIndex
CREATE INDEX "Ads_title_idx" ON "Ads"("title");

-- CreateIndex
CREATE INDEX "Ads_artist_idx" ON "Ads"("artist");

-- CreateIndex
CREATE INDEX "Ads_createdAt_idx" ON "Ads"("createdAt");
