-- CreateEnum
CREATE TYPE "MusicStatus" AS ENUM ('READY', 'PROCESSING', 'ERROR');

-- CreateTable
CREATE TABLE "Music" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filePath" TEXT,
    "status" "MusicStatus" NOT NULL DEFAULT 'READY',
    "youtubeUrl" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "artist" TEXT,
    "duration" INTEGER,
    "thumbnail" TEXT,
    "ytdl" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Music_youtubeId_key" ON "Music"("youtubeId");
