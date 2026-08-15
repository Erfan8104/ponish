-- CreateEnum
CREATE TYPE "ConsultationProjectType" AS ENUM ('ground', 'aerial', 'gis', 'unknown');

-- CreateEnum
CREATE TYPE "ConsultationContactTime" AS ENUM ('morning', 'noon', 'evening');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('pending', 'contacted', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "ConsultationRequest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "projectType" "ConsultationProjectType" NOT NULL,
    "description" TEXT NOT NULL,
    "contactTime" "ConsultationContactTime",
    "status" "ConsultationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsultationRequest_phone_idx" ON "ConsultationRequest"("phone");

-- CreateIndex
CREATE INDEX "ConsultationRequest_status_idx" ON "ConsultationRequest"("status");

-- CreateIndex
CREATE INDEX "ConsultationRequest_projectType_idx" ON "ConsultationRequest"("projectType");

-- CreateIndex
CREATE INDEX "ConsultationRequest_createdAt_idx" ON "ConsultationRequest"("createdAt");
