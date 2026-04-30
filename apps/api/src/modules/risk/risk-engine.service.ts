import { Injectable } from "@nestjs/common";
import { classifyRisk, type RiskClassification, type RiskSignals } from "@secure-recovery/domain";

export interface RiskEngine {
  assess(signals: RiskSignals): Promise<RiskClassification>;
}

@Injectable()
export class RuleBasedRiskEngine implements RiskEngine {
  async assess(signals: RiskSignals): Promise<RiskClassification> {
    return classifyRisk(signals);
  }
}

@Injectable()
export class RiskEngineService {
  constructor(private readonly engine: RuleBasedRiskEngine) {}

  assess(signals: RiskSignals) {
    return this.engine.assess(signals);
  }
}
