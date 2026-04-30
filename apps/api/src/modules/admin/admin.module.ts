import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { RecoveryModule } from "../recovery/recovery.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [RecoveryModule, AuditModule],
  controllers: [AdminController]
})
export class AdminModule {}
