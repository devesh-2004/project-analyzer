import { generateContentWithRetry } from "@/utils/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProjectExplanationResult } from "../types";


export async function explainProject(
  repoMetadata: any,
  fileTree: any,
  readmeContent: string,
  dependencyContent: string,
  sampleCode: string
): Promise<ProjectExplanationResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `You are a Senior AI Architecture Mentor explaining a codebase to a junior developer.
Analyze the provided repository files and structure recursively to build a holistic mental model of how the software operates.

Output STRICTLY as JSON matching exactly this schema:
{
  "overview": "A 2-3 sentence executive summary of what this project does and its core objective.",
  "architecture": "Explanation of the overarching pattern (e.g. Layered MVC, Event-driven, Monolithic Next.js).",
  "dataFlow": "Step-by-step description of how data moves from the user/client to the database/backend and back.",
  "folderStructureExplanation": [
    {
      "folderName": "e.g., src/modules or pages/api",
      "description": "What logic lives here and why it's isolated"
    }
  ],
  "keyFiles": [
    {
      "path": "e.g., src/lib/auth.ts",
      "role": "Explanation of the file's critical functionality"
    }
  ]
}

Return ONLY raw JSON, with absolutely no markdown formatting, code block backticks (like \`\`\`), or extra text.`;

  const userPrompt = `
Repository Data:
Name: ${repoMetadata?.name || "Unknown"}
Description: ${repoMetadata?.description || "No description"}

File Tree Summary (First 100 items):
${JSON.stringify(fileTree?.slice(0, 100) || [], null, 2)}

Dependencies:
${dependencyContent.substring(0, 3000)}

README & Key Implementation Logic:
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
    const explanation: ProjectExplanationResult = JSON.parse(responseText);
    return explanation;
  } catch (error) {
    console.error("Failed to parse Project Explainer response:", responseText);
    throw new Error("Failed to parse AI Explainer logic.");
  }
}
