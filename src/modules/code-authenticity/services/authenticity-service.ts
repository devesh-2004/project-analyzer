import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuthenticityAnalysisResult } from "../types";


export async function analyzeCodeAuthenticity(
  repoMetadata: any,
  fileTree: any,
  readmeContent: string,
  dependencyContent: string,
  sampleCode: string
): Promise<AuthenticityAnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `You are an elite Code Authenticity and Plagiarism Analyst.
Your goal is to detect whether a codebase is heavily AI-generated, blindly copied, or genuinely human-written.

Analyze the repository data. Heavily scrutinize the project structure, dependency anomalies, and provided sample code for:
- Evidence of robotic variable naming, hallucinated framework patterns, and overly verbose comments typical of LLMs.
- Blind copy-pasting (e.g., massive architecture mismatch, extreme variations in coding style across files).

Output strictly in JSON matching exactly this schema:
{
  "score": number (0-100 authenticity score; 100 means highly genuine human-written code, 0 means entirely synthetically generated or copied),
  "overallAssessment": "string explaining your verdict in 2-3 sentences max",
  "patternWarnings": [
    {
      "id": "must be unique string",
      "type": "ai-generation" | "copy-paste" | "boilerplate" | "hallucination",
      "description": "Explanation of the suspected pattern",
      "severity": "high" | "medium" | "low",
      "fileReference": "e.g., package.json or src/main.ts"
    }
  ],
  "skillMismatches": [
    {
      "description": "string describing an architectural choice that contrasts with basic mistakes",
      "evidence": "string explaining what raised this suspicion"
    }
  ],
  "conceptQuestions": [
    {
      "id": "must be unique string",
      "question": "A technical interview question proving the author understands the code they claimed to write (e.g. 'Why did you use Promise.all in file X?')",
      "expectedAnswer": "Brief description of the correct answer"
    }
  ]
}

Return raw JSON only, without backticks or markdown formatting.`;

  const userPrompt = `
Repository Data:
Name: ${repoMetadata?.name || "Unknown"}
Description: ${repoMetadata?.description || "No description"}

File Tree Summary (First 50 items):
${JSON.stringify(fileTree?.slice(0, 50) || [], null, 2)}

Dependencies:
${dependencyContent.substring(0, 3000)}

Code Sample / README:
${readmeContent.substring(0, 5000)}
${sampleCode.substring(0, 8000)}
`;

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: systemInstruction + "\\n\\n" + userPrompt }] }
    ],
    generationConfig: { responseMimeType: "application/json" }
  });

  const responseText = result.response.text();
  try {
    const analysis: AuthenticityAnalysisResult = JSON.parse(responseText);
    // Auto-generate some IDs if missing for React keys
    analysis.patternWarnings = analysis.patternWarnings?.map((p, i) => ({ ...p, id: p.id || `wp-${i}` })) || [];
    analysis.conceptQuestions = analysis.conceptQuestions?.map((q, i) => ({ ...q, id: q.id || `cq-${i}` })) || [];
    return analysis;
  } catch (error) {
    console.error("Failed to parse Authenticity analysis:", responseText);
    throw new Error("Failed to parse AI authenticity response.");
  }
}
