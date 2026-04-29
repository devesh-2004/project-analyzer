import { generateContentWithRetry } from "@/utils/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ATSAnalysisResult } from "../types";


export const analyzeResumePDF = async (base64Pdf: string): Promise<ATSAnalysisResult> => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `You are an expert strict Applicant Tracking System (ATS) and Senior Technical Recruiter.
You must analyze the provided resume strictly.

Provide the exact JSON output formatted as described:
{
  "score": number (0-100 indicating ATS likelihood of passing),
  "summary": "Brief summary of the candidate's profile",
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "improvements": [
    {
       "id": "must be unique string string like imp-1",
       "category": "formatting" | "impact" | "skills" | "keywords" | "clarity",
       "title": "Short title",
       "description": "Detailed actionable steps to fix"
    }
  ],
  "keywordMatchRate": number (0-100 indicating keyword optimization)
}

Do NOT include markdown syntax (like \`\`\`json). Return raw JSON only.
`;

  const result = await generateContentWithRetry(model, {
    contents: [
      { 
        role: "user", 
        parts: [
          { text: systemInstruction },
          {
            inlineData: {
              data: base64Pdf,
              mimeType: "application/pdf"
            }
          }
        ] 
      }
    ],
    generationConfig: { 
      responseMimeType: "application/json" 
    }
  });

  const responseText = result.response.text();
  try {
    const analysis: ATSAnalysisResult = JSON.parse(responseText);
    return analysis;
  } catch (error) {
    console.error("Failed to parse resume analysis:", responseText);
    throw new Error("Failed to parse ATS response from AI");
  }
};
