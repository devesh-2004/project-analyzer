import { NextRequest, NextResponse } from "next/server";
import { detectCodeRisks } from "@/modules/code-risk/services/riskAnalysisService";

export async function POST(req: NextRequest) {
    try {
        const { repoUrl, githubToken } = await req.json();

        if (!repoUrl) return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });

        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return NextResponse.json({ error: "Invalid GitHub URL format" }, { status: 400 });
        
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "");

        const headers: HeadersInit = { "Accept": "application/vnd.github.v3+json" };
        if (githubToken) { headers["Authorization"] = `Bearer ${githubToken}`; }

        const [metadataRes, readmeRes, treeRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers }),
        ]);

        if (!metadataRes.ok) return NextResponse.json({ error: "Repository not found or private" }, { status: 404 });

        const metadata = await metadataRes.json();
        let readmeContent = "";
        let fileTree: any[] = [];
        let dependencyContent = "";
        let sampleCode = "";

        if (readmeRes.ok) {
            const data = await readmeRes.json();
            readmeContent = atob(data.content);
        }

        if (treeRes.ok) {
            const data = await treeRes.json();
            if (Array.isArray(data)) fileTree = data;
        }

        const depFile = fileTree.find(f => ["package.json", "requirements.txt", "pom.xml"].includes(f.name));
        if (depFile) {
            try {
                const depRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${depFile.path}`, { headers });
                if (depRes.ok) dependencyContent = atob((await depRes.json()).content);
            } catch (err) {}
        }

        const codeFile = fileTree.find(f => [".ts", ".tsx", ".js", ".jsx", ".py"].some(ext => f.name.endsWith(ext)));
        if (codeFile) {
             try {
                const codeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${codeFile.path}`, { headers });
                if (codeRes.ok) sampleCode = `\n--- File: ${codeFile.name} ---\n` + atob((await codeRes.json()).content);
            } catch (err) {}
        }

        const riskReport = await detectCodeRisks(metadata, fileTree, readmeContent, dependencyContent, sampleCode);
        return NextResponse.json(riskReport);

    } catch (error: any) {
        console.error("Risk Analysis API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
