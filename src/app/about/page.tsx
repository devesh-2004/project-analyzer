
import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2, Github, Code2, LineChart } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <PublicNavbar />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <section className="container mx-auto px-4 text-center mb-24 animate-fade-in">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            AI-Powered Intelligence for Your <span className="text-primary">Codebase</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            ProjectCopilot analyzes your GitHub repositories to provide instant feedback on code quality, security, and architecture.
                            Get a roadmap to excellence in seconds.
                        </p>
                    </div>
                </section>

                {/* What This Platform Does */}
                <section className="container mx-auto px-4 mb-24">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/50 transition-colors">
                            <Code2 className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-semibold mb-3">Deep Code Analysis</h3>
                            <p className="text-muted-foreground">
                                Our AI scans every file to understand your project's structure, identifying antipatterns and suggesting modern best practices.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/50 transition-colors">
                            <LineChart className="h-10 w-10 text-blue-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-3">Scoring & Metrics</h3>
                            <p className="text-muted-foreground">
                                Get a quantifiable "Resume Readiness" score. benchmark your project against industry standards to see where you stand.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/50 transition-colors">
                            <CheckCircle2 className="h-10 w-10 text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-3">Actionable Roadmap</h3>
                            <p className="text-muted-foreground">
                                Don't just get errors—get solutions. We generate a step-by-step improvement plan tailored to your technical stack.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="container mx-auto px-4 mb-24 bg-card/50 rounded-3xl p-12 border border-border/50">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                        <p className="text-muted-foreground">Four simple steps to elevate your project</p>
                    </div>

                    <div className="relative">
                        {/* Connecting line (desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />

                        <div className="grid md:grid-cols-4 gap-8 relative z-10">
                            {[
                                { step: "01", title: "Connect", desc: "Login with Google or GitHub" },
                                { step: "02", title: "Select", desc: "Paste your Repo URL" },
                                { step: "03", title: "Analyze", desc: "AI scans your code" },
                                { step: "04", title: "Improve", desc: "Get your roadmap" }
                            ].map((item, index) => (
                                <div key={index} className="bg-background border border-border p-6 rounded-xl flex flex-col items-center text-center shadow-lg">
                                    <span className="text-4xl font-black text-primary/10 mb-2">{item.step}</span>
                                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Who It Is For */}
                <section className="container mx-auto px-4 mb-24">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 space-y-6">
                            <h2 className="text-3xl font-bold">Built for Developers at Every Stage</h2>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-primary">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">Students & Graduates</h4>
                                        <p className="text-muted-foreground">Make your portfolio projects employer-ready and ace your technical interviews.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-primary">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">Job Seekers</h4>
                                        <p className="text-muted-foreground">Ensure your GitHub profile showcases high-quality, documented, and testable code.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-primary">3</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">Professional Developers</h4>
                                        <p className="text-muted-foreground">Quickly audit legacy codebases or new libraries to ensure they meet your standards.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            {/* Abstract Illustration */}
                            <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent aspect-square rounded-full blur-3xl opacity-50 absolute" />
                            <div className="relative bg-card border border-border p-8 rounded-2xl shadow-2xl">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <div className="flex items-center gap-3">
                                            <Github className="h-6 w-6" />
                                            <span className="font-mono text-sm">user/platform-v1</span>
                                        </div>
                                        <span className="text-green-500 font-bold">92/100</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[92%]" />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Security: A+</span>
                                            <span>Performance: 98</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>CI/CD Pipeline detected</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Clean Architecture structure</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="container mx-auto px-4 text-center">
                    <div className="bg-primary text-primary-foreground rounded-3xl p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <Sparkles className="h-64 w-64" />
                        </div>

                        <h2 className="text-3xl font-bold mb-4 relative z-10">Ready to Analyze Your Project?</h2>
                        <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto relative z-10">
                            Join thousands of developers using ProjectCopilot to write better code and build better careers.
                        </p>
                        <Link href="/login" className="relative z-10">
                            <Button size="lg" variant="secondary" className="font-semibold">
                                Get Your Analysis Now
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} ProjectCopilot. All rights reserved.</p>
            </footer>
        </div>
    );
}
