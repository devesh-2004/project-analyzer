import { generateContentWithRetry } from "@/utils/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RiskAnalysisResult } from "../types";


export async function detectCodeRisks(
  repoMetadata: any,
  fileTree: any,
  readmeContent: string,
  dependencyContent: string,
  sampleCode: string
): Promise<RiskAnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `You are a strict Cyber Security and Architecture Auditor.
Inspect the provided repository context for insecure coding patterns, missing input validation, hardcoded secrets, and structural bad practices.

Output STRICTLY as JSON matching exactly this schema:
{
  "risks": [
    {
      "description": "Specific issue description (e.g. 'No input validation in user authentication API')",
      "severity": "high" | "medium" | "low",
      "fileReference": "File where this was deduced, or 'Architecture' if broad",
      "recommendation": "How to fix it"
    }
  ],
  "healthScore": number (0-100 indicating the safety and robustness of the code. 100 is perfectly secure and optimal)
}

Return ONLY raw JSON, with absolutely no markdown formatting or backticks.`;

  const userPrompt = `
Repository Data:
Name: ${repoMetadata?.name || "Unknown"}
Description: ${repoMetadata?.description || "No description"}

Dependencies (check for outdated/vulnerable packages):
${dependencyContent.substring(0, 3000)}

Code Sample / README:
${readmeContent.substring(0, 5000)}
${sampleCode.substring(0, 8000)}
`;

  const result = await generateContentWithRetry(model, {
    contents: [
      { role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }
    ],
    generationConfig: { responseMimeType: "application/json" }
  });

  const responseText = result.response.text();
  try {
    const analysis: RiskAnalysisResult = JSON.parse(responseText);
    return analysis;
  } catch (error) {
    console.error("Failed to parse Risk Detector response:", responseText);
    throw new Error("Failed to parse AI Risk logic.");
  }
}
