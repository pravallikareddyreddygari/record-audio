/*
  Warnings:

  - You are about to drop the column `audioData` on the `Recording` table. All the data in the column will be lost.
  - Added the required column `url` to the `Recording` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Recording" ("createdAt", "duration", "filename", "id", "updatedAt") SELECT "createdAt", "duration", "filename", "id", "updatedAt" FROM "Recording";
DROP TABLE "Recording";
ALTER TABLE "new_Recording" RENAME TO "Recording";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
