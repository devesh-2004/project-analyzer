import { generateContentWithRetry } from "@/utils/gemini";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


export async function POST(req: NextRequest) {
    try {
        const { repoUrl, githubToken } = await req.json();

        if (!repoUrl) {
            return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
        }

        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return NextResponse.json({ error: "Invalid GitHub URL format" }, { status: 400 });
        }
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "");

        const headers: HeadersInit = {
            "Accept": "application/vnd.github.v3+json",
        };
        if (githubToken) {
            headers["Authorization"] = `Bearer ${githubToken}`;
        }

        const [metadataRes, readmeRes, treeRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers }),
        ]);

        if (!metadataRes.ok) {
            return NextResponse.json({ error: "Repository not found or private" }, { status: 404 });
        }

        const metadata = await metadataRes.json();
        let readmeContent = "";
        if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            readmeContent = atob(readmeData.content);
        }

        let fileTree: { name: string; type: string; path: string }[] = [];
        if (treeRes.ok) {
            const treeData = await treeRes.json();
            if (Array.isArray(treeData)) {
                fileTree = treeData.map((item: any) => ({
                    name: item.name,
                    type: item.type,
                    path: item.path
                }));
            }
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a Technical Systems Architect.
Analyze the following Github Repository data and generate a high-level system architecture flowchart using Mermaid.js syntax.
The diagram should map out the likely client-server interactions, database, and major components based on the file tree and readme.
Use "graph TD" or "graph LR". Make it beautiful, use modern shapes, and apply classDefs if possible to color-code frontend/backend/db.

Repository Name: ${metadata.name}
Description: ${metadata.description || "N/A"}

Top files:
${JSON.stringify(fileTree.slice(0, 40), null, 2)}

README Snippet:
${readmeContent.substring(0, 3000)}

IMPORTANT: Return ONLY the raw Mermaid code block. Do NOT include Markdown formatting like \`\`\`mermaid or \`\`\`. Start immediately with 'graph'.`;

        const result = await generateContentWithRetry(model, prompt);
        let text = result.response.text().trim();
        // Fallback cleanup if model injected markdown
        if (text.startsWith('```mermaid')) text = text.replace(/^```mermaid\n/, '');
        if (text.startsWith('```')) text = text.replace(/^```\n/, '');
        if (text.endsWith('```')) text = text.replace(/\n```$/, '');

        return NextResponse.json({ diagram: text.trim() });
    } catch (error: any) {
        console.error("Diagram Generator API Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
