-- CreateEnum
CREATE TYPE "AmendmentStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "ContractAmendment" (
    "id" SERIAL NOT NULL,
    "contractId" INTEGER NOT NULL,
    "proposed_area" DOUBLE PRECISION NOT NULL,
    "proposed_amount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "status" "AmendmentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContractAmendment_contractId_idx" ON "ContractAmendment"("contractId");

-- CreateIndex
CREATE INDEX "ContractAmendment_status_idx" ON "ContractAmendment"("status");

-- AddForeignKey
ALTER TABLE "ContractAmendment" ADD CONSTRAINT "ContractAmendment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
