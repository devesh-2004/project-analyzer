"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreCircle } from "@/components/ScoreCircle";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    Github, ExternalLink, Download, CheckCircle2, AlertCircle, Lightbulb,
    FileText, Code, Shield, TestTube, BookOpen, Rocket, Fingerprint,
    MessageSquare, AlertTriangle, GraduationCap, LayoutDashboard
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";

// New specialized modules
import { ExplainerView } from "@/modules/explainer/components/ExplainerView";
import { ChatInterface } from "@/modules/codebase-chat/components/ChatInterface";
import { RiskDashboard } from "@/modules/code-risk/components/RiskDashboard";
import { QuizInterface } from "@/modules/understanding-test/components/QuizInterface";
import { AuthenticityReport } from "@/modules/code-authenticity/components/AuthenticityReport";
import { MermaidDiagram } from "@/modules/diagram-generator/components/MermaidDiagram";
import { useProjects } from "@/context/ProjectContext";

// --- Mock Data Preserved for robustness ---
const mockAnalysisData = {
    project: {
        name: "E-Commerce Platform", url: "github.com/user/ecommerce-app", analyzedAt: "2024-01-15", techStack: ["React", "Node.js", "PostgreSQL"],
    },
    overallScore: 87,
    categories: [
        { name: "Code Quality", score: 85, icon: Code },
        { name: "Documentation", score: 78, icon: BookOpen },
        { name: "Testing", score: 72, icon: TestTube },
        { name: "Security", score: 90, icon: Shield },
        { name: "Best Practices", score: 88, icon: CheckCircle2 },
    ],
    evaluationCriteria: [
        { criterion: "Code Structure & Modularity", description: "Evaluating how well the codebase is organized into scalable, maintainable components." },
        { criterion: "Security Best Practices", description: "Checking for common vulnerabilities, hardcoded secrets, and dependency risks." },
    ],
    improvements: [
        {
            id: "1", category: "Testing", priority: "high", title: "Increase test coverage",
            description: "Your test coverage is at 45%. Aim for at least 80% coverage.", steps: ["Add unit tests", "Add E2E tests"]
        }
    ],
    roadmap: [
        { phase: "Week 1", title: "Testing Foundation", tasks: ["Set up Jest"] }
    ],
    resumeReadiness: {
        ready: true, score: 87, highlights: ["Clean architecture"], suggestions: ["Add live demo link"]
    }
};

const getPriorityVariant = (priority: string) => priority === "high" ? "destructive" : priority === "medium" ? "warning" : "secondary";

export default function AnalysisResultPage() {
    const params = useParams();
    const id = params?.id as string;
    const { projects } = useProjects();

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "explain" | "chat" | "risks" | "architecture" | "test" | "authenticity">("overview");
    const [authenticityResult, setAuthenticityResult] = useState(null);
    const [authenticityLoading, setAuthenticityLoading] = useState(false);

    useEffect(() => {
        const foundProject = projects.find(p => p.id === id);
        if (foundProject) setProject(foundProject);
        else if (id === "demo") setProject({ ...mockAnalysisData.project, score: mockAnalysisData.overallScore });
        setLoading(false);
    }, [id, projects]);

    const analysisData = {
        ...mockAnalysisData,
        project: project ? { name: project.name, url: project.url, analyzedAt: project.analyzedAt, techStack: project.techStack } : mockAnalysisData.project,
        overallScore: project ? project.score : mockAnalysisData.overallScore
    };

    const handleCheckAuthenticity = async () => {
        if (!project || !project.url) return;
        setAuthenticityLoading(true);
        setActiveTab("authenticity");
        try {
            const res = await fetch("/api/v2/authenticity/analyze", {
                 method: "POST", headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ repoUrl: project.url })
            });
            const data = await res.json();
            setAuthenticityResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setAuthenticityLoading(false);
        }
    };

    if (loading || !project) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex justify-center items-center h-[80vh]"><p>Loading intelligence...</p></div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const navigationItems = [
        { id: "overview", label: "Health Hub", icon: LayoutDashboard },
        { id: "explain", label: "Project Explainer", icon: BookOpen },
        { id: "chat", label: "Codebase Chat", icon: MessageSquare },
        { id: "architecture", label: "Architecture", icon: Code },
        { id: "risks", label: "Risk Scan", icon: AlertTriangle },
        { id: "authenticity", label: "Authenticity Check", icon: Fingerprint },
        { id: "test", label: "Test My Skills", icon: GraduationCap },
    ];

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 min-h-[85vh]">
                    
                    {/* Sidebar Nav (Redesigned VS Code / Linear style) */}
                    <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                        <div className="mb-6 px-2">
                            <h2 className="text-xl font-bold truncate" title={project.name}>{project.name}</h2>
                            <a href={project.url.startsWith("http") ? project.url : `https://${project.url}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 truncate">
                                <Github className="h-3 w-3" /> {project.url.replace("https://github.com/", "")}
                            </a>
                        </div>
                        
                        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                            {navigationItems.map(item => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (item.id === "authenticity" && !authenticityResult && !authenticityLoading) {
                                                handleCheckAuthenticity();
                                            } else {
                                                setActiveTab(item.id as any);
                                            }
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${
                                            isActive 
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                        
                        {/* Overall Small status indicator */}
                        <div className="mt-auto hidden md:block bg-gradient-to-t from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
                             <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Project Quality</div>
                             <ScoreCircle score={analysisData.overallScore} size="sm" showLabel={false} />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-background/50 border border-border/50 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                           <AnimatePresence mode="wait">
                               
                               {/* 1. OVERVIEW (Classic Health Report) */}
                               {activeTab === "overview" && (
                                   <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-card rounded-2xl border border-border shadow-sm">
                                            <ScoreCircle score={analysisData.overallScore} size="lg" label="Health Score" />
                                            <div className="flex-1 text-center md:text-left">
                                                <h2 className="text-2xl font-bold mb-2">Project Diagnostics</h2>
                                                <p className="text-muted-foreground mb-4">Codebase structure validated against modern standards.</p>
                                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                                    {analysisData.project.techStack.map((tech: string) => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-5">
                                            {analysisData.categories.map((category) => (
                                                <Card key={category.name} className="bg-card">
                                                    <CardContent className="p-4 text-center">
                                                        <category.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                                                        <p className="text-sm text-muted-foreground mb-1">{category.name}</p>
                                                        <p className="text-2xl font-bold">{category.score}</p>
                                                        <Progress value={category.score} className="mt-2 h-2" />
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>

                                        {analysisData.evaluationCriteria && analysisData.evaluationCriteria.length > 0 && (
                                            <Card>
                                                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Evaluation Criteria</CardTitle></CardHeader>
                                                <CardContent>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        {analysisData.evaluationCriteria.map((criterion: any, idx: number) => (
                                                            <div key={idx} className="bg-secondary/30 p-4 rounded-lg flex flex-col gap-1 border border-border/50">
                                                                <h4 className="font-semibold text-sm flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary" />{criterion.criterion}</h4>
                                                                <p className="text-sm text-muted-foreground">{criterion.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        <Card>
                                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> AI Improvement Roadmap</CardTitle></CardHeader>
                                            <CardContent>
                                                <Accordion type="single" collapsible className="space-y-4">
                                                    {analysisData.improvements.map((improvement) => (
                                                        <AccordionItem key={improvement.id} value={improvement.id} className="border rounded-lg px-4">
                                                            <AccordionTrigger className="hover:no-underline py-4">
                                                                <div className="flex items-center gap-4 text-left">
                                                                    <Badge variant={getPriorityVariant(improvement.priority) as any}>{improvement.priority}</Badge>
                                                                    <div><p className="font-medium">{improvement.title}</p><p className="text-sm text-muted-foreground">{improvement.category}</p></div>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pb-4">
                                                                <p className="text-muted-foreground mb-4">{improvement.description}</p>
                                                                <ul className="space-y-2 bg-secondary/30 p-4 rounded-lg">
                                                                    {improvement.steps.map((step: string, i: number) => <li key={i} className="text-sm"><b>{i+1}.</b> {step}</li>)}
                                                                </ul>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            </CardContent>
                                        </Card>
                                   </motion.div>
                               )}

                               {/* 2. EXPLAINER */}
                               {activeTab === "explain" && (
                                   <motion.div key="explain" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                      <ExplainerView repoUrl={project.url} />
                                   </motion.div>
                               )}

                               {/* 3. CHAT */}
                               {activeTab === "chat" && (
                                   <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                                      <ChatInterface repoUrl={project.url} />
                                   </motion.div>
                               )}

                               {/* 4. ARCHITECTURE */}
                               {activeTab === "architecture" && (
                                   <motion.div key="architecture" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                      <Card className="bg-transparent border-none shadow-none">
                                          <CardHeader className="px-0">
                                              <CardTitle className="text-2xl flex items-center gap-2"><Code className="h-6 w-6 text-primary" /> Architecture Visualizer</CardTitle>
                                              <CardDescription>Mermaid.js vector graphs recursively built by Gemini.</CardDescription>
                                          </CardHeader>
                                          <CardContent className="px-0">
                                              <MermaidDiagram repoUrl={project.url} />
                                          </CardContent>
                                      </Card>
                                   </motion.div>
                               )}

                               {/* 5. RISKS */}
                               {activeTab === "risks" && (
                                   <motion.div key="risks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                      <RiskDashboard repoUrl={project.url} />
                                   </motion.div>
                               )}

                               {/* 6. AUTHENTICITY */}
                               {activeTab === "authenticity" && (
                                   <motion.div key="authenticity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                      {authenticityLoading ? (
                                         <div className="flex flex-col items-center justify-center py-20 animate-pulse text-primary">
                                             <Fingerprint className="h-16 w-16 mb-4 opacity-50" />
                                             <p>Scanning code stylometry...</p>
                                         </div>
                                      ) : authenticityResult ? (
                                         <AuthenticityReport result={authenticityResult} />
                                      ) : (
                                          <div className="py-20 text-center"><p className="text-red-500">Failed to load authenticity context.</p></div>
                                      )}
                                   </motion.div>
                               )}

                               {/* 7. TEST (QUIZ) */}
                               {activeTab === "test" && (
                                   <motion.div key="test" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                      <QuizInterface repoUrl={project.url} />
                                   </motion.div>
                               )}

                           </AnimatePresence>
                        </div>
                    </div>
                    
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
