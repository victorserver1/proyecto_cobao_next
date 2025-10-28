-- CreateEnum
CREATE TYPE "status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Audio" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "status" "status" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,

    CONSTRAINT "Audio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
