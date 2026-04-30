import { Module } from "@nestjs/common";
import { RiskEngineService, RuleBasedRiskEngine } from "./risk-engine.service";

@Module({
  providers: [RiskEngineService, RuleBasedRiskEngine],
  exports: [RiskEngineService]
})
export class RiskModule {}
