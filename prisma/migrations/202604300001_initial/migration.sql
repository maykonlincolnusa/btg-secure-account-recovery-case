CREATE TYPE "RecoveryStatus" AS ENUM ('INITIATED', 'IDENTITY_PENDING', 'FACE_VERIFIED', 'LIVENESS_VERIFIED', 'RISK_EVALUATING', 'STEP_UP_REQUIRED', 'UNDER_REVIEW', 'COOLDOWN', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "SuggestedDecision" AS ENUM ('AUTO_APPROVE', 'STEP_UP', 'HOLD', 'REJECT');

CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "accountIdentifier" TEXT NOT NULL UNIQUE,
  "maskedEmail" TEXT,
  "maskedPhone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "RecoveryRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "protocolId" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "status" "RecoveryStatus" NOT NULL,
  "targetEmailMasked" TEXT,
  "targetPhoneMasked" TEXT,
  "previousEmailMasked" TEXT,
  "previousPhoneMasked" TEXT,
  "idempotencyKey" TEXT,
  "consentAcceptedAt" TIMESTAMP(3),
  "cooldownUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3)
);

CREATE TABLE "VerificationAttempt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recoveryRequestId" TEXT NOT NULL REFERENCES "RecoveryRequest"("id"),
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "success" BOOLEAN NOT NULL,
  "score" INTEGER,
  "reasonCode" TEXT,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "RiskAssessment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recoveryRequestId" TEXT NOT NULL REFERENCES "RecoveryRequest"("id"),
  "riskScore" INTEGER NOT NULL,
  "riskLevel" "RiskLevel" NOT NULL,
  "suggestedDecision" "SuggestedDecision" NOT NULL,
  "reasons" JSONB NOT NULL,
  "signals" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recoveryRequestId" TEXT REFERENCES "RecoveryRequest"("id"),
  "actorType" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "requestId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "StatusHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recoveryRequestId" TEXT NOT NULL REFERENCES "RecoveryRequest"("id"),
  "fromStatus" "RecoveryStatus",
  "toStatus" "RecoveryStatus" NOT NULL,
  "reason" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "NotificationEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recoveryRequestId" TEXT NOT NULL REFERENCES "RecoveryRequest"("id"),
  "channel" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "recipientMasked" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ManualReviewDecision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recoveryRequestId" TEXT NOT NULL REFERENCES "RecoveryRequest"("id"),
  "decision" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ContactChangeRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "recoveryRequestId" TEXT NOT NULL UNIQUE REFERENCES "RecoveryRequest"("id"),
  "newEmailMasked" TEXT NOT NULL,
  "newPhoneMasked" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "executedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "IdempotencyKey" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "scope" TEXT NOT NULL,
  "responseHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "RecoveryRequest_status_createdAt_idx" ON "RecoveryRequest"("status", "createdAt");
CREATE INDEX "RecoveryRequest_userId_createdAt_idx" ON "RecoveryRequest"("userId", "createdAt");
CREATE INDEX "AuditEvent_recoveryRequestId_createdAt_idx" ON "AuditEvent"("recoveryRequestId", "createdAt");
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");
