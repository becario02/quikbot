/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "AgentPrompt" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolDescription" (
    "id" SERIAL NOT NULL,
    "toolName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "supportDescription" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolDescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentPrompt_type_key" ON "AgentPrompt"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ToolDescription_toolName_key" ON "ToolDescription"("toolName");
