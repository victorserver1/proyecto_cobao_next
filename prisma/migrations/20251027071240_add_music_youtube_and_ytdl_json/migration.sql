/*
  Warnings:

  - The values [ERROR] on the enum `MusicStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[youtubeUrl]` on the table `Music` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MusicStatus_new" AS ENUM ('DRAFT', 'READY', 'PROCESSING', 'FAILED', 'ARCHIVED');
ALTER TABLE "public"."Music" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Music" ALTER COLUMN "status" TYPE "MusicStatus_new" USING ("status"::text::"MusicStatus_new");
ALTER TYPE "MusicStatus" RENAME TO "MusicStatus_old";
ALTER TYPE "MusicStatus_new" RENAME TO "MusicStatus";
DROP TYPE "public"."MusicStatus_old";
ALTER TABLE "Music" ALTER COLUMN "status" SET DEFAULT 'READY';
COMMIT;

-- AlterTable
ALTER TABLE "Music" ADD COLUMN     "errorMsg" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ALTER COLUMN "youtubeUrl" DROP NOT NULL,
ALTER COLUMN "youtubeId" DROP NOT NULL,
ALTER COLUMN "ytdl" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Music_youtubeUrl_key" ON "Music"("youtubeUrl");

-- CreateIndex
CREATE INDEX "Music_status_idx" ON "Music"("status");

-- CreateIndex
CREATE INDEX "Music_userId_idx" ON "Music"("userId");

-- CreateIndex
CREATE INDEX "Music_title_idx" ON "Music"("title");

-- CreateIndex
CREATE INDEX "Music_artist_idx" ON "Music"("artist");

-- CreateIndex
CREATE INDEX "Music_createdAt_idx" ON "Music"("createdAt");

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
