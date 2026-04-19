export interface CodeRisk {
  description: string;
  severity: "high" | "medium" | "low";
  fileReference?: string;
  recommendation?: string;
}

export interface RiskAnalysisResult {
  risks: CodeRisk[];
  healthScore: number;
}
