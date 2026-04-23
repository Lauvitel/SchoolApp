-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "classId" TEXT;

-- CreateIndex
CREATE INDEX "Grade_studentId_idx" ON "Grade"("studentId");

-- CreateIndex
CREATE INDEX "Grade_classId_idx" ON "Grade"("classId");

-- CreateIndex
CREATE INDEX "Grade_courseName_idx" ON "Grade"("courseName");
