/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `isReady` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[currentVersionId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'PENDING_AUTHOR', 'PENDING_ADMIN', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "content",
DROP COLUMN "images",
DROP COLUMN "isReady",
DROP COLUMN "published",
DROP COLUMN "score",
DROP COLUMN "title",
ADD COLUMN     "currentVersionId" INTEGER;

-- CreateTable
CREATE TABLE "PostVersion" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "lastEditedById" TEXT,
    "submittedById" TEXT,
    "reviewedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostVersion_postId_idx" ON "PostVersion"("postId");

-- CreateIndex
CREATE INDEX "PostVersion_status_idx" ON "PostVersion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Post_currentVersionId_key" ON "Post"("currentVersionId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_currentVersionId_idx" ON "Post"("currentVersionId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "PostVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVersion" ADD CONSTRAINT "PostVersion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVersion" ADD CONSTRAINT "PostVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVersion" ADD CONSTRAINT "PostVersion_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
