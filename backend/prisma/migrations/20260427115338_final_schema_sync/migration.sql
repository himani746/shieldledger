/*
  Warnings:

  - You are about to drop the `AnchorEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Signatory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_userId_fkey";

-- DropTable
DROP TABLE "AnchorEvent";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "DocumentVersion";

-- DropTable
DROP TABLE "Signatory";

-- DropTable
DROP TABLE "User";
