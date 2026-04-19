import { NextRequest, NextResponse } from "next/server";
import { chatWithCodebase } from "@/modules/codebase-chat/services/chatService";

export async function POST(req: NextRequest) {
    try {
        const { repoUrl, githubToken, message, history = [] } = await req.json();

        if (!repoUrl || !message) return NextResponse.json({ error: "Repository URL and message are required" }, { status: 400 });

        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return NextResponse.json({ error: "Invalid GitHub URL format" }, { status: 400 });
        
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "");
        const headers: HeadersInit = { "Accept": "application/vnd.github.v3+json" };
        if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

        const [metadataRes, treeRes, readmeRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers })
        ]);

        if (!metadataRes.ok) return NextResponse.json({ error: "Repository not found or private" }, { status: 404 });

        const metadata = await metadataRes.json();
        let fileTree: any[] = [];
        let readmeContent = "";
        let sampleCode = "";

        if (treeRes.ok) {
            fileTree = await treeRes.json();
            const codeFile = Array.isArray(fileTree) ? fileTree.find(f => [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java"].some(ext => f.name.endsWith(ext))) : null;
            if (codeFile) {
                try {
                    const codeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${codeFile.path}`, { headers });
                    if (codeRes.ok) sampleCode = `\n--- File: ${codeFile.name} ---\n` + atob((await codeRes.json()).content);
                } catch (err) {}
            }
        }
        
        if (readmeRes.ok) {
            readmeContent = atob((await readmeRes.json()).content);
        }

        const reply = await chatWithCodebase(message, history, metadata, fileTree, readmeContent, sampleCode);
        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
