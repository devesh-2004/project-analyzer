"use client";

import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "@/components/FeatureCard";
import { StepCard } from "@/components/StepCard";
import { PageTransition } from "@/components/PageTransition";
import {
    Brain,
    Target,
    FileCheck,
    Github,
    ArrowRight,
    Sparkles,
    BarChart3,
    CheckCircle2,
    Zap
} from "lucide-react";
// import heroBg from "@/assets/hero-bg.jpg"; 
// Note: Next.js Image component is better, but simplified for now.
// If assets import fails, we will move to public/

const features = [
    {
        icon: Brain,
        title: "AI-Powered Scoring",
        description: "Get instant, comprehensive analysis of your project's code quality, architecture, and best practices using advanced AI.",
    },
    {
        icon: Target,
        title: "Improvement Roadmap",
        description: "Receive actionable, prioritized suggestions to elevate your project from good to exceptional.",
    },
    {
        icon: FileCheck,
        title: "Resume Readiness",
        description: "Know exactly when your project is polished enough to showcase to recruiters and interviewers.",
    },
];

const steps = [
    {
        step: 1,
        title: "Submit Your Project",
        description: "Paste your GitHub repository URL and select your project type. We support React, Node.js, Python, and 50+ tech stacks.",
    },
    {
        step: 2,
        title: "AI Analyzes Everything",
        description: "Our AI reviews your code structure, patterns, documentation, tests, and compares against industry standards.",
    },
    {
        step: 3,
        title: "Get Actionable Insights",
        description: "Receive a detailed report with scores, improvements, and a clear roadmap to make your project stand out.",
    },
];

export default function LandingPage() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    {/* <img 
            src={heroBg as unknown as string} 
            alt="" 
            className="w-full h-full object-cover opacity-30"
          /> */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/20" /> {/* Fallback gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <Badge variant="secondary" className="mb-6 animate-fade-in">
                            <Zap className="h-3 w-3 mr-1" />
                            Powered by Advanced AI
                        </Badge>

                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            Analyze your project{" "}
                            <span className="text-primary">like an expert</span>
                        </h1>

                        <p className="mb-8 text-lg text-muted-foreground md:text-xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                            Get AI-powered insights to transform your projects into portfolio-ready
                            showcases. Perfect for students, developers, and job seekers.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                            <Link href="/submit">
                                <Button size="lg" className="h-14 px-8 text-lg">
                                    <Github className="h-5 w-5 mr-2" />
                                    Analyze Project
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                                    View Demo
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Social proof */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>1,000+ projects analyzed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>50+ tech stacks supported</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Free to get started</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4">Features</Badge>
                        <h2 className="text-3xl font-bold md:text-4xl mb-4">
                            Everything you need to level up
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our AI-powered platform provides comprehensive analysis and actionable insights
                            to make your projects stand out from the crowd.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={feature.title}
                                {...feature}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-20 md:py-32 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
                        <div>
                            <Badge variant="outline" className="mb-4">How it Works</Badge>
                            <h2 className="text-3xl font-bold md:text-4xl mb-4">
                                From code to career-ready in 3 steps
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Our streamlined process makes it easy to get valuable feedback on your
                                projects. No complex setup required.
                            </p>

                            <div className="space-y-2">
                                {steps.map((step) => (
                                    <StepCard key={step.step} {...step} />
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 p-8 flex items-center justify-center">
                                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 w-full max-w-sm shadow-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <BarChart3 className="h-5 w-5 text-primary" />
                                            <div className="h-2 flex-1 rounded-full bg-primary/20" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-1/3 rounded-full bg-green-500/30" />
                                            <div className="h-2 flex-1 rounded-full bg-muted" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2/3 rounded-full bg-primary/30" />
                                            <div className="h-2 flex-1 rounded-full bg-muted" />
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Overall Score</span>
                                                <span className="font-bold text-primary">87/100</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="relative rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90" />
                        <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl mb-4 text-primary-foreground">
                                Ready to level up your projects?
                            </h2>
                            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                                Join thousands of developers who are using AI to build better,
                                more impressive portfolio projects.
                            </p>
                            <Link href="/login">
                                <Button variant="secondary" size="lg" className="h-14 px-8 text-lg shadow-xl">
                                    Get Started Free
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-semibold">ProjectCopilot</span>
                        </div>
                        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                        </nav>
                        <p className="text-sm text-muted-foreground">
                            © 2024 ProjectCopilot. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
        </PageTransition>
    );
}
