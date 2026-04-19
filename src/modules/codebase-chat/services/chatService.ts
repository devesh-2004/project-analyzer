import { GoogleGenerativeAI } from "@google/generative-ai";


export async function chatWithCodebase(
  message: string,
  history: any[],
  repoMetadata: any,
  fileTree: any,
  readmeContent: string,
  sampleCode: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `You are an AI Codebase Intelligence Mentor.
You are having an interactive chat with the developer about their repository.
Use the repository context below as your ground truth. Keep answers concise, highly specific to the repo, and formatted nicely in markdown.

Repository Name: ${repoMetadata?.name || "Unknown"}
Description: ${repoMetadata?.description || ""}

File Tree Summary:
${JSON.stringify(fileTree?.slice(0, 100) || [], null, 2)}

Code Sample / README Extracts:
${readmeContent.substring(0, 3000)}
${sampleCode.substring(0, 5000)}
`;

  const chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Context configured. I will ask questions now." }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to answer questions about this specific repository architecture." }]
      },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ],
    generationConfig: {
      maxOutputTokens: 1000,
    },
    systemInstruction: { role: "system", parts: [{ text: systemInstruction }]}
  });

  const result = await chatSession.sendMessage(message);
  return result.response.text();
}
