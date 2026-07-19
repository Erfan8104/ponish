-- AlterTable
ALTER TABLE "ContractAmendment" ADD COLUMN     "proposed_length" DOUBLE PRECISION,
ALTER COLUMN "proposed_area" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "corridorLength" DOUBLE PRECISION,
ADD COLUMN     "mappingType" TEXT,
ADD COLUMN     "terrainTypes" JSONB DEFAULT '[]';
