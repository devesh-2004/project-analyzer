export interface UnderstandingQuestion {
  id: string;
  question: string;
  hints: string[];
}

export interface UnderstandingTest {
  questions: UnderstandingQuestion[];
}

export interface UnderstandingEvaluation {
  score: number;
  correctCount: number;
  feedback: {
    questionId: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}
