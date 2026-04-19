import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


export async function POST(req: NextRequest) {
    try {
        const { repoUrl, githubToken } = await req.json();

        if (!repoUrl) return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });

        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return NextResponse.json({ error: "Invalid GitHub URL format" }, { status: 400 });
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "");
        const headers: HeadersInit = { "Accept": "application/vnd.github.v3+json" };
        if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

        const [metadataRes, readmeRes, treeRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers }),
        ]);

        if (!metadataRes.ok) return NextResponse.json({ error: "Repository not found or private" }, { status: 404 });

        const metadata = await metadataRes.json();
        let readmeContent = "";
        let fileTree: any[] = [];
        if (readmeRes.ok) readmeContent = atob((await readmeRes.json()).content);
        if (treeRes.ok) {
            const treeData = await treeRes.json();
            if (Array.isArray(treeData)) fileTree = treeData;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemInstruction = `You are a strict Software Architect auditing a codebase.
Analyze the repository data. You must return TWO things strictly formatted as a JSON object:
1. A valid standalone Mermaid.js graph code (starting with \`graph TD\` or \`graph LR\`) representing the system.
2. An architectural critique explaining what the architecture is, what the flaws are (e.g., monolithic coupling, lack of service layers), and a strong recommendation.

Output strictly as JSON matching EXACTLY this schema:
{
  "mermaidDiagram": "Raw mermaid code string...",
  "architectureExplanation": {
    "currentArchitecture": "What pattern runs this project?",
    "critique": "Criticisms like 'tightly coupled' or 'missing validation layer'",
    "recommendation": "What should the developer do to scale it better?"
  }
}

Return ONLY raw JSON, absolutely no extra text or markdown formatting.`;

        const userPrompt = `
Repository: ${metadata.name}
Description: ${metadata.description}
File Tree Summary:
${JSON.stringify(fileTree.slice(0, 100), null, 2)}
README Snippet:
${readmeContent.substring(0, 4000)}`;

        const result = await model.generateContent({
             contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }],
             generationConfig: { responseMimeType: "application/json" }
        });

        const responseText = result.response.text();
        const analysis = JSON.parse(responseText);

        return NextResponse.json(analysis);

    } catch (error: any) {
        console.error("Architecture Intelligence API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
