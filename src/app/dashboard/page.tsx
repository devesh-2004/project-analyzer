"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/ScoreCircle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    FolderPlus,
    ArrowRight,
    Github,
} from "lucide-react";

const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", variant: "success" as const };
    if (score >= 60) return { label: "Good", variant: "default" as const };
    if (score >= 40) return { label: "Needs Work", variant: "warning" as const };
    return { label: "Critical", variant: "destructive" as const };
};

// ... imports
import { useProjects } from "@/context/ProjectContext";
import { GitHubRepoList } from "@/components/dashboard/GitHubRepoList";
import { Sparkles } from "lucide-react";
import { DeveloperIntelligenceWidget } from "@/modules/developer-score/components/DeveloperIntelligenceWidget";

export default function Dashboard() {
    const { projects } = useProjects();
    const totalProjects = projects.length;

    // Derived stats
    const averageScore = totalProjects > 0
        ? Math.round(projects.reduce((acc, p) => acc + p.score, 0) / totalProjects)
        : 0;
    const resumeReady = projects.filter(p => p.score >= 80).length;

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-muted-foreground">
                                Manage and analyze your projects
                            </p>
                        </div>
                        <Link href="/submit">
                            <Button>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                New Analysis
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Section - Only show if we have projects */}
                    {totalProjects > 0 ? (
                        <div className="space-y-8">
                            <DeveloperIntelligenceWidget />

                            {/* Key Metrics */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Projects</p>
                                                <p className="text-3xl font-bold">{totalProjects}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Github className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Average Score</p>
                                                <p className="text-3xl font-bold">{averageScore}</p>
                                            </div>
                                            <ScoreCircle score={averageScore} size="sm" showLabel={false} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Resume Ready</p>
                                                <p className="text-3xl font-bold">{resumeReady}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <span className="text-green-500 font-bold">✓</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Analysis Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">Recent Analysis</h2>
                                    <Link href="/analysis" className="text-sm text-primary hover:underline flex items-center">
                                        View All <ArrowRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                                <div className="grid gap-4">
                                    {projects.slice(0, 3).map((project) => {
                                        const scoreStatus = getScoreStatus(project.score);
                                        return (
                                            <Link key={project.id} href={`/analysis/${project.id}`} className="block">
                                                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/50">
                                                    <CardContent className="p-6">
                                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                                            <ScoreCircle score={project.score} size="sm" showLabel={false} />
                                                            <div className="flex-1 space-y-1">
                                                                <h3 className="font-semibold text-lg">{project.name}</h3>
                                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                    <Badge variant={scoreStatus.variant as any}>{scoreStatus.label}</Badge>
                                                                    <span>{project.analyzedAt}</span>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm">
                                                                Details <ArrowRight className="h-4 w-4 ml-2" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Welcome Banner for New Users
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                    <Sparkles className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Welcome to ProjectCopilot</h3>
                                    <p className="text-muted-foreground">
                                        Select a repository below to run your first AI analysis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Repository List - ALWAYS Visible */}
                    <div className="pt-4 border-t border-border/50">
                        <GitHubRepoList />
                    </div>

                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
