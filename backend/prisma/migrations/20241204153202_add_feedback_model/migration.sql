-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "userQuery" TEXT NOT NULL,
    "botResponse" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
