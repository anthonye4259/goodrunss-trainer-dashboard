-- CreateTable
CREATE TABLE IF NOT EXISTS "gia_memory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "source" TEXT NOT NULL DEFAULT 'conversation',
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "useCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "gia_memory_userId_idx" ON "gia_memory"("userId");
CREATE INDEX IF NOT EXISTS "gia_memory_userId_importance_idx" ON "gia_memory"("userId", "importance");
CREATE INDEX IF NOT EXISTS "gia_memory_userId_memoryType_idx" ON "gia_memory"("userId", "memoryType");
CREATE UNIQUE INDEX IF NOT EXISTS "gia_memory_userId_memoryType_category_key_key" ON "gia_memory"("userId", "memoryType", "category", "key");
