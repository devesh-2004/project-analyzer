import { sendMessageWithRetry } from "@/utils/gemini";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API

export async function POST(req: NextRequest) {
    try {
        const { messages, projectContext } = await req.json();

        if (!messages || !projectContext) {
            return NextResponse.json({ error: "Missing messages or project context" }, { status: 400 });
        }

        // Construct System Prompt based on the specific project context
        const systemPrompt = `
        You are a Senior Software Architect assisting a developer with their project.
        
        CONTEXT:
        The developer has analyzed their GitHub repository: "${projectContext.name}" (${projectContext.url}).
        
        ANALYSIS SUMMARY:
        - Score: ${projectContext.score}/100
        - Tech Stack: ${projectContext.techStack.join(", ")}
        - Key Strengths: ${JSON.stringify(projectContext.strengths)}
        - Key Weaknesses: ${JSON.stringify(projectContext.weaknesses)}
        - Resume Readiness: ${projectContext.resumeReadiness?.ready ? "Ready" : "Not Ready"}
        
        INSTRUCTIONS:
        1. Answer the user's questions utilizing ONLY the information above and general software engineering knowledge.
        2. Do NOT try to read new files or browse the web. You only know what is in the analysis summary.
        3. Be encouraging but honest. Give concise, actionable advice.
        4. If the user asks about specific code implementation details that are not in the summary, explain that you only have the high-level analysis and suggest they check the specific file recommendation in the dashboard.
        
        Keep your responses short (under 3-4 sentences) unless a detailed explanation is requested.
        `;

        // Prepare the conversation history for Gemini
        const chatHistory = messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Inject System Prompt into the very first message
        if (chatHistory.length > 0) {
            chatHistory[0].parts[0].text = systemPrompt + "\n\n" + chatHistory[0].parts[0].text;
        }

        // Use the same model alias that works in analyze route
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const chat = model.startChat({
            history: chatHistory.slice(0, -1), // History excluding the latest message
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const lastMessage = chatHistory[chatHistory.length - 1].parts[0].text;
        try {
            const result = await sendMessageWithRetry(chat, lastMessage);
            const response = result.response;
            const text = response.text();
            
            return NextResponse.json({ reply: text });
        } catch (genError: any) {
            console.error("Gemini Generation Error:", genError.message);
            // Fallback response so the UI doesn't crash on leaked/invalid API keys
            return NextResponse.json({ 
                reply: "Hello! It looks like there's an issue connecting strictly to the AI server right now (most likely an invalid or leaked API key). I'm currently running in 'mock' fallback mode so I can't analyze specific files, but your code dashboard seems to be running!" 
            });
        }

    } catch (error: any) {
        console.error("Chat API Error Details:", error);
        return NextResponse.json({
            error: "Failed to generate response",
            details: error.message
        }, { status: 500 });
    }
}
