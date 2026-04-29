import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult, ChatSession, GenerateContentRequest } from "@google/generative-ai";

export async function generateContentWithRetry(
  model: GenerativeModel,
  request: string | Array<string | any> | GenerateContentRequest,
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<GenerateContentResult> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await model.generateContent(request as any);
    } catch (error: any) {
      attempt++;
      console.warn(`Gemini API attempt ${attempt} failed: ${error.message}`);
      if (attempt >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Failed after retries");
}

export async function sendMessageWithRetry(
  chatSession: ChatSession,
  message: string | Array<string | any>,
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<GenerateContentResult> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await chatSession.sendMessage(message as any);
    } catch (error: any) {
      attempt++;
      console.warn(`Gemini API sendMessage attempt ${attempt} failed: ${error.message}`);
      if (attempt >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Failed after retries");
}
