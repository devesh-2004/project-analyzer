"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, ArrowRight, Github, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Repository {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    updated_at: string;
    visibility: string;
}

export function GitHubRepoList() {
    const { user } = useAuth();
    const [repos, setRepos] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRepos = async () => {
            if (!user?.githubToken) return;

            // MOCK DATA HANDLING
            if (user.githubToken === "mock-github-token") {
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

                // Allow private repos if we "upgraded" (for demo, we can just toggle standard mock set)
                // In a real app we'd check the scope, here we'll assume the user toggled it if they asked.
                // Or better, let's just return a fixed set that includes a private one to demonstrate UI.
                const mockRepos: Repository[] = [
                    {
                        id: 1,
                        name: "start-up-landing-page",
                        description: "Modern landing page for SaaS startups built with Next.js",
                        html_url: "https://github.com/demo/start-up-landing-page",
                        stargazers_count: 124,
                        language: "TypeScript",
                        updated_at: new Date().toISOString(),
                        visibility: "public"
                    },
                    {
                        id: 2,
                        name: "ecommerce-api",
                        description: "REST API for e-commerce platform using Express and MongoDB",
                        html_url: "https://github.com/demo/ecommerce-api",
                        stargazers_count: 89,
                        language: "JavaScript",
                        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
                        visibility: "public"
                    },
                    {
                        id: 3,
                        name: "internal-dashboard",
                        description: "Company metrics dashboard with real-time updates",
                        html_url: "https://github.com/demo/internal-dashboard",
                        stargazers_count: 12,
                        language: "React",
                        updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
                        visibility: "private" // Demo private repo
                    }
                ];
                setRepos(mockRepos);
                setLoading(false);
                return;
            }

            try {
                // Fetch 'all' to get private repos if the token allows it
                const response = await fetch("https://api.github.com/user/repos?type=all&sort=updated&per_page=100", {
                    headers: {
                        Authorization: `Bearer ${user.githubToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch repositories");
                }

                const data = await response.json();
                setRepos(data);
            } catch (err) {
                console.error(err);
                setError("Could not load your repositories. Please try again.");
                toast.error("Failed to fetch GitHub repositories");
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, [user?.githubToken]);

    const handleEnablePrivate = () => {
        // Redirect to login with private=true to upgrade scope
        window.location.href = "/api/auth/github/login?private=true";
    };

    if (!user?.githubToken) return null;

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse border border-border/50" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 border border-destructive/20 bg-destructive/5 rounded-xl">
                <p className="text-destructive font-medium mb-2">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    const hasPrivateRepos = repos.some(r => r.visibility === 'private');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Your Repositories</h2>
                <div className="flex items-center gap-2">
                    {!hasPrivateRepos && (
                        <Button variant="outline" size="sm" onClick={handleEnablePrivate}>
                            <Lock className="h-3 w-3 mr-2" />
                            Enable Private Repos
                        </Button>
                    )}
                    <Badge variant="outline" className="font-normal">
                        {hasPrivateRepos ? "Public & Private Access" : "Public Access Only"}
                    </Badge>
                </div>
            </div>

            {repos.length === 0 ? (
                <div className="text-center p-8 border border-border border-dashed rounded-xl">
                    <Github className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">No repositories found</h3>
                    <p className="text-muted-foreground text-sm">
                        {'We couldn\'t find any repositories content.'}
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repos.map((repo) => (
                        <Card key={repo.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {repo.visibility === 'private' ? (
                                            <Lock className="h-4 w-4 text-yellow-500 shrink-0" />
                                        ) : (
                                            <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                                        )}
                                        <CardTitle className="text-base font-semibold truncate" title={repo.name}>
                                            {repo.name}
                                        </CardTitle>
                                    </div>
                                    <Badge variant={repo.visibility === 'private' ? "default" : "secondary"} className="text-xs shrink-0 capitalize">
                                        {repo.visibility}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2 text-xs min-h-[2.5em]">
                                    {repo.description || "No description provided"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3 flex-1">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    {repo.language && (
                                        <div className="flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            {repo.language}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        {repo.stargazers_count}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <GitFork className="h-3 w-3" />
                                        <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Link href={`/submit?repo=${encodeURIComponent(repo.html_url)}`} className="w-full">
                                    <Button size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        Analyze Project
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
