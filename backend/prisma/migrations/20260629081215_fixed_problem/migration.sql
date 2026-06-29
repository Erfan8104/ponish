-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "areaSelectionMethod" TEXT,
ADD COLUMN     "outputFormats" JSONB,
ADD COLUMN     "techType" JSONB;
