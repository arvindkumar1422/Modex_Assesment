/*
  Warnings:

  - You are about to drop the column `name` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `totalSeats` on the `Show` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[showId,row,number]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `userId` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `price` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `row` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Show` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Seat_showId_number_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "row" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "Show" DROP COLUMN "name",
DROP COLUMN "totalSeats",
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "poster" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 150.0,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_showId_row_number_key" ON "Seat"("showId", "row", "number");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
