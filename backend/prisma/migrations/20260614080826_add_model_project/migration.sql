-- CreateTable
CREATE TABLE "public"."Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "areaSelectionMethod" TEXT NOT NULL DEFAULT 'map',
    "polygonCoordinates" JSONB,
    "geoJson" JSONB,
    "calculatedArea" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "coordinateSystem" TEXT NOT NULL DEFAULT 'WGS84',
    "utmZone" TEXT,
    "techType" TEXT[],
    "outputFormats" TEXT[],
    "requiredAccuracy" TEXT NOT NULL DEFAULT '1-5cm',
    "deliveryTime" TEXT NOT NULL DEFAULT '1-week',
    "budgetType" TEXT NOT NULL DEFAULT 'custom',
    "minBudget" TEXT,
    "maxBudget" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
