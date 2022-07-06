/*
  Warnings:

  - A unique constraint covering the columns `[alias]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alias` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alias" TEXT NOT NULL,
ALTER COLUMN "avatar" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_alias_key" ON "User"("alias");
