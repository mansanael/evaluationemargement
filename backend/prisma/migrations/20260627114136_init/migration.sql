-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "poste" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Seminar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Seminar_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signatureData" TEXT NOT NULL,
    "signedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guestName" TEXT,
    "guestPoste" TEXT,
    "seminarId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Attendance_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "Seminar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nom" TEXT,
    "poste" TEXT,
    "pertinence" TEXT NOT NULL,
    "objectifsAtteints" TEXT NOT NULL,
    "niveauAdaptation" TEXT NOT NULL,
    "themesCommentaire" TEXT,
    "methodeEfficace" TEXT NOT NULL,
    "maitriseSujet" TEXT NOT NULL,
    "participationEncouragee" TEXT NOT NULL,
    "rythme" TEXT NOT NULL,
    "logistique" TEXT NOT NULL,
    "supportsClairs" TEXT NOT NULL,
    "ameliorationsOrganisation" TEXT,
    "competencesAcquises" TEXT NOT NULL,
    "recommandation" BOOLEAN NOT NULL,
    "satisfactionGlobale" INTEGER NOT NULL,
    "plusAppreciee" TEXT,
    "pointsAmeliorer" TEXT,
    "seminarId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Evaluation_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "Seminar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seminarId" TEXT NOT NULL,
    CONSTRAINT "Resource_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "Seminar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
