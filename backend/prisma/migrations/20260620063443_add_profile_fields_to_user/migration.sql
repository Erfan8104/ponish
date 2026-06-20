-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('employer', 'freelancer');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "birthDate" TEXT,
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "freelancerCity" TEXT,
ADD COLUMN     "freelancerProvince" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "role" "public"."UserRole",
ADD COLUMN     "skills" TEXT;
