-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "type" TEXT NOT NULL DEFAULT 'text',
    "group" TEXT DEFAULT 'general',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "Setting_group_idx" ON "Setting"("group");

-- CreateIndex
CREATE INDEX "Setting_key_idx" ON "Setting"("key");
