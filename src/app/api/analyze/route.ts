import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API

export async function POST(req: NextRequest) {
    try {
        const { repoUrl, githubToken } = await req.json();

        if (!repoUrl) {
            return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
        }

        // 1. Extract Owner/Repo from URL
        // Supports: github.com/owner/repo or https://github.com/owner/repo
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return NextResponse.json({ error: "Invalid GitHub URL format" }, { status: 400 });
        }
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, ""); // Remove .git if present

        // 2. Fetch GitHub Data (Metadata, README, Tree)
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

        // 2a. Detect and Fetch Dependency Files
        let dependencyContent = "";
        const dependencyFiles = ["package.json", "requirements.txt", "pom.xml", "build.gradle", "go.mod", "cargo.toml", "composer.json", "Gemfile", "mix.exs"];

        const foundDependencyFile = fileTree.find(f => dependencyFiles.includes(f.name));

        if (foundDependencyFile) {
            try {
                const depRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${foundDependencyFile.path}`, { headers });
                if (depRes.ok) {
                    const depData = await depRes.json();
                    dependencyContent = atob(depData.content);
                }
            } catch (err) {
                console.log("Failed to fetch dependency file:", err);
            }
        }

        // 3. Construct Prompt for Gemini
        const systemInstruction = `You are a Senior Software Architect. Analyze the following GitHub repository based on its README, file structure, and dependency files.
    
    Provide the output strictly in the following JSON format:
    {
      "score": number (0-100),
      "techStack": string[],
      "summary": "Brief summary of what this project does",
      "strengths": ["string", "string"],
      "weaknesses": ["string", "string"],
      "improvements": [
        {
           "id": "1",
           "category": "Testing" | "Documentation" | "Code Quality" | "Security" | "Best Practices",
           "priority": "high" | "medium" | "low",
           "title": "Short title",
           "description": "Detailed description",
           "steps": ["Step 1", "Step 2"]
        }
      ],
      "categories": [
        { "name": "Code Quality", "score": number },
        { "name": "Documentation", "score": number },
        { "name": "Testing", "score": number },
        { "name": "Security", "score": number },
        { "name": "Best Practices", "score": number }
      ],
      "resumeReadiness": {
         "ready": boolean,
         "score": number,
         "highlights": ["string"],
         "suggestions": ["string"]
      },
      "roadmap": [
         { "phase": "Week 1", "title": "string", "tasks": ["string"] },
         { "phase": "Week 2", "title": "string", "tasks": ["string"] }
      ]
    }
    
    IMPORTANT: Accurately detect the "techStack" based on the provided dependency file content and file structure.
    Do not include markdown code blocks (like \`\`\`json) in the response, just the raw JSON object.`;

        const userPrompt = `
    Repository: ${owner}/${repo}
    Description: ${metadata.description || "No description"}
    Stars: ${metadata.stargazers_count}
    
    File Structure (Top Level):
    ${JSON.stringify(fileTree, null, 2)}
    
    Dependency File (${foundDependencyFile?.name || "None Found"}):
    ${dependencyContent.substring(0, 5000)}
    
    README Content:
    ${readmeContent.substring(0, 15000)} // Truncate to avoid token limits if massive
    `;

        // 4. Call Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = result.response;
        const text = response.text();

        // 5. Parse and Format Response
        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 });
        }

        // Merge with metadata for the final object
        const finalResult = {
            id: Math.random().toString(36).substr(2, 9),
            name: repo,
            url: `github.com/${owner}/${repo}`,
            analyzedAt: new Date().toISOString().split("T")[0],
            ...analysis
        };

        return NextResponse.json(finalResult);

    } catch (error: any) {
        console.error("Analysis error details:", error);
        console.error("API Key present:", !!process.env.GEMINI_API_KEY);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
