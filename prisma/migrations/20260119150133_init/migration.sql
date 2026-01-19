/*
  Warnings:

  - You are about to drop the column `sessionId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `form_submissions` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_sessionId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "sessionId",
ALTER COLUMN "phone" SET NOT NULL;

-- DropTable
DROP TABLE "form_submissions";

-- CreateIndex
CREATE INDEX "questions_section_order_idx" ON "questions"("section", "order");
