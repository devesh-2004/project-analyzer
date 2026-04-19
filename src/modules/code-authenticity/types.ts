export interface AuthenticityConceptQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
}

export interface AuthenticityPatternWarning {
  id: string;
  type: "ai-generation" | "copy-paste" | "boilerplate" | "hallucination";
  description: string;
  severity: "high" | "medium" | "low";
  fileReference?: string;
}

export interface AuthenticityMismatch {
  description: string;
  evidence: string;
}

export interface AuthenticityAnalysisResult {
  score: number; // 0-100 indicating probability of human-written code
  overallAssessment: string;
  patternWarnings: AuthenticityPatternWarning[];
  skillMismatches: AuthenticityMismatch[];
  conceptQuestions: AuthenticityConceptQuestion[];
}
