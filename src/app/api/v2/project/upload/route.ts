import { generateContentWithRetry } from "@/utils/gemini";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import AdmZip from "adm-zip";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No ZIP file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        // 1. Build File Tree
        const fileTree = zipEntries.map(entry => ({
            name: entry.entryName.split("/").pop() || entry.entryName,
            path: entry.entryName,
            type: entry.isDirectory ? "dir" : "file"
        }));

        // 2. Extract Readme
        const readmeEntry = zipEntries.find(e => e.entryName.toLowerCase().includes("readme.md"));
        const readmeContent = readmeEntry ? readmeEntry.getData().toString("utf8") : "";

        // 3. Extract Dependencies
        const dependencyFiles = ["package.json", "requirements.txt", "pom.xml", "build.gradle", "go.mod", "cargo.toml"];
        const depEntry = zipEntries.find(e => dependencyFiles.some(d => e.entryName.endsWith(d)));
        const dependencyContent = depEntry ? depEntry.getData().toString("utf8") : "";

        // 4. Extract Sample Code
        const codeFiles = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rs"];
        const codeEntry = zipEntries.find(e => !e.isDirectory && codeFiles.some(ext => e.entryName.endsWith(ext)));
        const sampleCode = codeEntry ? `\n--- File: ${codeEntry.entryName} ---\n` + codeEntry.getData().toString("utf8") : "";

        // 5. Build mock Metadata
        const metadata = {
            name: file.name.replace(".zip", ""),
            description: "Analysed from ZIP upload",
            url: `local://${file.name}`
        };

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemInstruction = `You are an expert software architect and technical lead.
Analyze the following repository data and provide a comprehensive evaluation.
Be strict but constructive.

Output strictly as JSON matching EXACTLY this schema:
{
    "score": number (0-100),
    "techStack": string[],
    "architecture": "description of the architecture",
    "categories": [
        { "name": "Code Quality", "score": number },
        { "name": "Documentation", "score": number },
        { "name": "Testing", "score": number },
        { "name": "Security", "score": number },
        { "name": "Best Practices", "score": number }
    ],
    "improvements": [
        {
            "id": "unique-id",
            "category": "Code Quality|Documentation|Testing|Security|Best Practices",
            "priority": "high|medium|low",
            "title": "Short title",
            "description": "Detailed explanation",
            "steps": ["Actionable step 1", "Actionable step 2"]
        }
    ],
    "resumeReadiness": {
        "ready": boolean,
        "highlights": ["Strong point 1", "Strong point 2"],
        "suggestions": ["Improvement 1", "Improvement 2"]
    }
}

Return ONLY raw JSON, absolutely no backticks or markdown formatting.`;

        const userPrompt = `
Repository Name: ${metadata.name}
Description: ${metadata.description}

File Tree Summary:
${JSON.stringify(fileTree.slice(0, 100), null, 2)}

Dependencies:
${dependencyContent.substring(0, 3000)}

Sample Code / README:
${readmeContent.substring(0, 5000)}
${sampleCode.substring(0, 8000)}
`;

        const result = await generateContentWithRetry(model, {
            contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const responseText = result.response.text();
        const analysis = JSON.parse(responseText);

        const projectData = {
            id: crypto.randomUUID(),
            name: metadata.name,
            url: metadata.url,
            analyzedAt: new Date().toISOString().split("T")[0],
            techStack: analysis.techStack || [],
            score: analysis.score,
            analysisRaw: analysis
        };

        return NextResponse.json(projectData);
    } catch (error: any) {
        console.error("ZIP Upload API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
