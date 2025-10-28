/*
  Warnings:

  - You are about to drop the column `userId` on the `Music` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Music" DROP CONSTRAINT "Music_userId_fkey";

-- DropIndex
DROP INDEX "public"."Music_userId_idx";

-- AlterTable
ALTER TABLE "Music" DROP COLUMN "userId";
