import { NextRequest, NextResponse } from "next/server";
import { explainProject } from "@/modules/explainer/services/projectExplainerService";

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

        const dependencyFiles = ["package.json", "requirements.txt", "pom.xml", "build.gradle", "go.mod", "cargo.toml", "composer.json"];
        const foundDependencyFile = fileTree.find(f => dependencyFiles.includes(f.name));
        let dependencyContent = "";

        if (foundDependencyFile) {
            try {
                const depRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${foundDependencyFile.path}`, { headers });
                if (depRes.ok) {
                    const depData = await depRes.json();
                    dependencyContent = atob(depData.content);
                }
            } catch (err) {
                console.log("Ignored dependency fetch error");
            }
        }

        const codeFiles = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rs"];
        const foundCodeFile = fileTree.find(f => codeFiles.some(ext => f.name.endsWith(ext)));
        let sampleCode = "";

        if (foundCodeFile) {
             try {
                const codeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${foundCodeFile.path}`, { headers });
                if (codeRes.ok) {
                    const codeData = await codeRes.json();
                    sampleCode = `\n--- File: ${foundCodeFile.name} ---\n` + atob(codeData.content);
                }
            } catch (err) { }
        }

        const explanation = await explainProject(
            metadata,
            fileTree,
            readmeContent,
            dependencyContent,
            sampleCode
        );

        return NextResponse.json(explanation);

    } catch (error: any) {
        console.error("Explainer API Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
