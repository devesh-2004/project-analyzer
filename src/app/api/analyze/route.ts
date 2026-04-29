import { generateContentWithRetry } from "@/utils/gemini";
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
      ],
      "evaluationCriteria": [
         {
            "criterion": "string",
            "description": "string"
         }
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        let analysis;
        try {
            const result = await generateContentWithRetry(model, {
                contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const response = result.response;
            const text = response.text();
            
            try {
                analysis = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse Gemini response:", text);
                return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 });
            }
        } catch (apiError: any) {
            console.error("Gemini API Error:", apiError.message);
            // Fallback mock data if API key is invalid/leaked or rate limited
            analysis = {
               score: 82,
               techStack: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
               summary: "This is a placeholder summary generated because the Gemini API request failed (e.g., due to an invalid or leaked API key).",
               strengths: ["Modern tech stack usage", "Clean UI architecture"],
               weaknesses: ["Missing comprehensive automated tests", "Incomplete CI/CD pipeline"],
               improvements: [
                 {
                    id: "mock1",
                    category: "Testing",
                    priority: "high",
                    title: "Implement Unit Tests",
                    description: "Setup Jest and React Testing Library to write unit tests for key components.",
                    steps: ["npm install -D jest @testing-library/react", "Create a test for the main page"]
                 }
               ],
               categories: [
                 { name: "Code Quality", score: 85 },
                 { name: "Documentation", score: 70 },
                 { name: "Testing", score: 40 },
                 { name: "Security", score: 90 },
                 { name: "Best Practices", score: 80 }
               ],
               resumeReadiness: {
                  ready: true,
                  score: 82,
                  highlights: ["Real-world feature implementation", "Integration with third-party APIs"],
                  suggestions: ["Add a live demo link", "Document setup instructions clearly"]
               },
               roadmap: [
                  { phase: "Week 1", title: "Testing Setup", tasks: ["Configure Jest", "Write initial component tests"] }
               ],
               evaluationCriteria: [
                  { criterion: "Security", description: "Minimal security risks detected" },
                  { criterion: "Code Structure", description: "Modular components and clean separation of concerns" }
               ]
            };
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
