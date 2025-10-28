/*
  Warnings:

  - You are about to drop the column `currentVersionId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `PostVersion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_currentVersionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostVersion" DROP CONSTRAINT "PostVersion_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostVersion" DROP CONSTRAINT "PostVersion_lastEditedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostVersion" DROP CONSTRAINT "PostVersion_postId_fkey";

-- DropIndex
DROP INDEX "public"."Post_currentVersionId_idx";

-- DropIndex
DROP INDEX "public"."Post_currentVersionId_key";

-- DropIndex
DROP INDEX "public"."Post_userId_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "currentVersionId",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."PostVersion";

-- DropEnum
DROP TYPE "public"."VersionStatus";
