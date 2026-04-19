"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Github, Loader2, ArrowRight, Info, UploadCloud, FileArchive, Link as LinkIcon } from "lucide-react";
import { useProjects, AnalyzedProject } from "@/context/ProjectContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const projectTypes = [
    { value: "web-app", label: "Web Application" },
    { value: "api", label: "REST API / Backend" },
    { value: "mobile", label: "Mobile App" },
    { value: "cli", label: "CLI Tool" },
    { value: "library", label: "Library / Package" },
    { value: "data-science", label: "Data Science / ML" },
];

const techStacks = [
    { value: "react", label: "React" },
    { value: "nextjs", label: "Next.js" },
    { value: "vue", label: "Vue.js" },
    { value: "angular", label: "Angular" },
    { value: "nodejs", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "django", label: "Django" },
    { value: "fastapi", label: "FastAPI" },
    { value: "java", label: "Java / Spring" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
];

function SubmitProjectForm() {
    const [mode, setMode] = useState<"github" | "zip">("github");
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [url, setUrl] = useState("");
    const [projectType, setProjectType] = useState("");
    const [techStack, setTechStack] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addProject } = useProjects();
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const repoParam = searchParams.get("repo");
        if (repoParam) {
            setUrl(repoParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let response;
            if (mode === "github") {
                response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ repoUrl: url, githubToken: user?.githubToken }),
                });
            } else {
                if (!zipFile) throw new Error("Please select a ZIP file");
                const formData = new FormData();
                formData.append("file", zipFile);
                response = await fetch("/api/v2/project/upload", {
                    method: "POST",
                    body: formData,
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Analysis failed");
            }

            const data = await response.json();
            addProject(data);
            toast({
                title: "Analysis Complete",
                description: "Your project has been successfully analyzed.",
            });
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Submission error:", error);
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: error.message || "Failed to analyze repository. Please check your input and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isValidUrl = url.includes("github.com/");

    return (
        <Card className="backdrop-blur-sm bg-background/50">
            <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                    We'll analyze your repository structure, code quality, and best practices
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex bg-secondary/50 rounded-lg p-1 mb-6">
                   <button 
                      type="button"
                      onClick={() => setMode("github")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === "github" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                   >
                     <LinkIcon className="h-4 w-4" /> GitHub Repository
                   </button>
                   <button 
                      type="button"
                      onClick={() => setMode("zip")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === "zip" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                   >
                     <FileArchive className="h-4 w-4" /> Upload .ZIP
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === "github" ? (
                      <div className="space-y-2 translate-y-0 opacity-100 transition-all">
                          <Label htmlFor="url">GitHub Repository URL</Label>
                          <div className="relative">
                              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                  id="url"
                                  type="url"
                                  placeholder="https://github.com/username/repository"
                                  value={url}
                                  onChange={(e) => setUrl(e.target.value)}
                                  className="pl-10"
                                  required={mode === "github"}
                              />
                          </div>
                          {url && !isValidUrl && (
                              <p className="text-sm text-destructive">Please enter a valid GitHub URL</p>
                          )}
                      </div>
                    ) : (
                      <div className="space-y-2 translate-y-0 opacity-100 transition-all">
                          <Label>Upload Project Archive (.zip)</Label>
                          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer relative group">
                             <input 
                               type="file" 
                               accept=".zip" 
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                               onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                               required={mode === "zip"}
                             />
                             <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="h-6 w-6 text-primary" />
                             </div>
                             {zipFile ? (
                                <div className="space-y-1">
                                  <p className="font-semibold text-primary">{zipFile.name}</p>
                                  <p className="text-sm text-muted-foreground">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                             ) : (
                                <div>
                                  <p className="font-medium">Click to upload or drag and drop</p>
                                  <p className="text-sm text-muted-foreground mt-1">ZIP archives containing your codebase</p>
                                </div>
                             )}
                          </div>
                      </div>
                    )}

                    {/* Project Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Project Type</Label>
                        <Select value={projectType} onValueChange={setProjectType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                            <SelectContent>
                                {projectTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-2">
                        <Label htmlFor="stack">Primary Tech Stack (Optional)</Label>
                        <Select value={techStack} onValueChange={setTechStack}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select primary technology (or auto-detect)" />
                            </SelectTrigger>
                            <SelectContent>
                                {techStacks.map((stack) => (
                                    <SelectItem key={stack.value} value={stack.value}>
                                        {stack.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Info box */}
                    <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium mb-1">What we analyze</p>
                            <ul className="text-muted-foreground space-y-1">
                                <li>• <strong>Tech Stack Auto-Detection</strong></li>
                                <li>• Code structure and organization</li>
                                <li>• Documentation quality (README, comments)</li>
                                <li>• Best practices and design patterns</li>
                            </ul>
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={(mode === "github" && (!url || !isValidUrl)) || (mode === "zip" && !zipFile) || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Analyzing your project...
                            </>
                        ) : (
                            <>
                                Start Analysis
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function SubmitProjectPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold">Submit Project</h1>
                        <p className="text-muted-foreground">
                            Enter your GitHub repository URL to get AI-powered analysis
                        </p>
                    </div>

                    <Suspense fallback={<Card><CardContent className="h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>}>
                        <SubmitProjectForm />
                    </Suspense>

                    {/* Tips */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-3">Tips for better analysis</h3>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>• Make sure your repository is public or add our bot as a collaborator</li>
                                <li>• Include a comprehensive README.md file</li>
                                <li>• Commit your package.json/requirements.txt for dependency analysis</li>
                                <li>• Add test files for testing coverage insights</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
