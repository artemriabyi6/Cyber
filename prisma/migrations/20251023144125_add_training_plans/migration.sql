-- CreateTable
CREATE TABLE "training_plans" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "intensity" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "exercises" TEXT[],
    "assignedTo" TEXT[],
    "createdBy" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "completedDate" TEXT,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);
