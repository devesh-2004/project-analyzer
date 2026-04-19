"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/context/ProjectContext";
import { ScoreCircle } from "@/components/ScoreCircle";
import { Github, Calendar, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AnalysisPage() {
    const { projects } = useProjects();

    const getScoreStatus = (score: number) => {
        if (score >= 80) return { label: "Excellent", variant: "success" as const };
        if (score >= 60) return { label: "Good", variant: "default" as const };
        if (score >= 40) return { label: "Needs Work", variant: "warning" as const };
        return { label: "Critical", variant: "destructive" as const };
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold">Analysis Results</h1>
                    <p className="text-muted-foreground">View detailed reports of your analyzed projects</p>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                        <BarChart3 className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">No analysis yet</h3>
                        <p className="text-muted-foreground mb-6">Start by analyzing your first repository</p>
                        <Link href="/submit">
                            <Button>New Analysis</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project) => {
                            const scoreStatus = getScoreStatus(project.score);
                            return (
                                <Link key={project.id} href={`/analysis/${project.id}`} className="block">
                                    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/50">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                <ScoreCircle score={project.score} size="sm" showLabel={false} />

                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-semibold text-lg">{project.name}</h3>
                                                        <Badge variant={scoreStatus.variant as any}>{scoreStatus.label}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Github className="h-4 w-4" />
                                                        <span>{project.url}</span>
                                                        <span className="mx-2">•</span>
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{project.analyzedAt}</span>
                                                    </div>
                                                </div>

                                                <Button variant="outline" size="sm">
                                                    View Report <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
