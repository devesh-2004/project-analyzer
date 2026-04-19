export interface ImprovementSuggestion {
  id: string;
  category: "formatting" | "impact" | "skills" | "keywords" | "clarity";
  title: string;
  description: string;
}

export interface ATSAnalysisResult {
  score: number; // 0 - 100
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
  };
  strengths: string[];
  weaknesses: string[];
  improvements: ImprovementSuggestion[];
  keywordMatchRate: number; // 0 - 100
}
