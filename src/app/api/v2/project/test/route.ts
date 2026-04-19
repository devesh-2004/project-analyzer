import { NextRequest, NextResponse } from "next/server";
import { generateProjectTest, submitProjectTest } from "@/modules/understanding-test/services/understandingTestService";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Mode 2: Submit Answers
        if (body.action === "submit") {
             const { answers, originalQuestions } = body;
             const evaluation = await submitProjectTest(answers, originalQuestions);
             return NextResponse.json(evaluation);
        }

        // Mode 1: Generate Test
        const { repoUrl, githubToken } = body;
        if (!repoUrl) return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });

        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return NextResponse.json({ error: "Invalid GitHub URL format" }, { status: 400 });
        
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "");
        const headers: HeadersInit = { "Accept": "application/vnd.github.v3+json" };
        if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

        const [metadataRes, treeRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers })
        ]);

        if (!metadataRes.ok) return NextResponse.json({ error: "Repository not found or private" }, { status: 404 });

        const metadata = await metadataRes.json();
        let fileTree: any[] = [];
        let sampleCode = "";

        if (treeRes.ok) {
            fileTree = await treeRes.json();
            const codeFile = Array.isArray(fileTree) ? fileTree.find(f => [".ts", ".tsx", ".js", ".jsx", ".py", ".go"].some(ext => f.name.endsWith(ext))) : null;
            if (codeFile) {
                try {
                    const codeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${codeFile.path}`, { headers });
                    if (codeRes.ok) sampleCode = `\n--- File: ${codeFile.name} ---\n` + atob((await codeRes.json()).content);
                } catch (err) {}
            }
        }

        const testPayload = await generateProjectTest(metadata, fileTree, "", "", sampleCode);
        return NextResponse.json(testPayload);

    } catch (error: any) {
        console.error("Understanding Test API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
