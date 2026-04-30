import { Module } from "@nestjs/common";
import { RecoveryController } from "./recovery.controller";
import { RecoveryService } from "./recovery.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { AuditModule } from "../audit/audit.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { RiskModule } from "../risk/risk.module";
import { MockFaceMatchProvider } from "./providers/face-match.provider";
import { MockLivenessProvider } from "./providers/liveness.provider";
import { SystemClockProvider } from "./providers/clock.provider";

@Module({
  imports: [AuditModule, NotificationsModule, RiskModule],
  controllers: [RecoveryController],
  providers: [RecoveryService, PrismaService, MockFaceMatchProvider, MockLivenessProvider, SystemClockProvider],
  exports: [RecoveryService]
})
export class RecoveryModule {}
