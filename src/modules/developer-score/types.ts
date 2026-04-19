export interface DeveloperIntelligenceData {
  score: number;
  level: "Novice" | "Intermediate" | "Advanced" | "Expert";
  strengths: string[];
  weaknesses: string[];
  metrics: {
    averageProjectScore: number;
    resumeScore: number;
    securityScore: number;
    totalProjects: number;
  };
}
