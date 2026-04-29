import { generateContentWithRetry } from "@/utils/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UnderstandingTest, UnderstandingEvaluation } from "../types";


export async function generateProjectTest(
  repoMetadata: any,
  fileTree: any,
  readmeContent: string,
  dependencyContent: string,
  sampleCode: string
): Promise<UnderstandingTest> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `You are a Technical Interviewer testing a developer on a codebase they supposedly built.
Based on the architecture and sample code provided, generate 3 highly specific technical questions about how the code functions. 

Output STRICTLY as JSON matching exactly this schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "A specific question about the logic (e.g. Why async/await used here? Explain this middleware)",
      "hints": ["Optional hint 1", "Optional hint 2"]
    }
  ]
}

Return ONLY raw JSON, zero markdown formatting.`;

  const userPrompt = `
Repository: ${repoMetadata?.name}
Files: ${JSON.stringify(fileTree?.slice(0, 20))}
Sample Code:
${sampleCode.substring(0, 4000)}
`;

  const result = await generateContentWithRetry(model, {
    contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    return JSON.parse(result.response.text());
  } catch (error) {
    throw new Error("Failed to generate test.");
  }
}

export async function submitProjectTest(answers: { questionId: string, answer: string }[], originalQuestions: any[]): Promise<UnderstandingEvaluation> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `You are an AI Grader evaluating a developer's answers about their own code.
You will be provided with the Questions and the User's Answers.
Evaluate if the answers demonstrate real understanding.

Output STRICTLY as JSON matching exactly this schema:
{
  "score": number (0-100),
  "correctCount": number (how many were substantially correct),
  "feedback": [
    {
      "questionId": "string matching the input",
      "isCorrect": boolean,
      "explanation": "Brief explanation of why it is correct or what was missed."
    }
  ]
}

Return ONLY raw JSON, zero markdown formatting.`;

  const userPrompt = `
Questions & Answers:
${JSON.stringify({ questions: originalQuestions, userAnswers: answers }, null, 2)}
`;

  const result = await generateContentWithRetry(model, {
    contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    return JSON.parse(result.response.text());
  } catch (error) {
    throw new Error("Failed to evaluate test.");
  }
}
