"use client";

import { PublicNavbar } from "@/components/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <PublicNavbar />

            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-30 -z-10" />

            <main className="container mx-auto px-4 pt-32 pb-20">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Simple, transparent <span className="text-primary">pricing</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Choose the plan that fits your needs. No hidden fees. Cancel anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <Card className="flex flex-col border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        <CardHeader>
                            <CardTitle>Hobby</CardTitle>
                            <CardDescription>Perfect for personal projects</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {[
                                    "3 Projects per month",
                                    "Basic AI Analysis",
                                    "Community Support",
                                    "Public Repo Analysis"
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/signup" className="w-full">
                                <Button variant="outline" className="w-full">Get Started</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="flex flex-col border-primary bg-card/80 backdrop-blur-sm shadow-2xl relative animate-fade-in-up scale-105 z-10" style={{ animationDelay: "0.2s" }}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <Zap className="h-3 w-3 fill-current" />
                                POPULAR
                            </span>
                        </div>
                        <CardHeader>
                            <CardTitle>Pro Developer</CardTitle>
                            <CardDescription>For serious builders & job seekers</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">$19</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {[
                                    "Unlimited Projects",
                                    "Deep AI Analysis (GPT-4 Level)",
                                    "Resume Readiness Score",
                                    "PDF Report Export",
                                    "Priority Support",
                                    "Private Repo Analysis"
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/signup" className="w-full">
                                <Button size="lg" className="w-full shadow-md">Start Free Trial</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Team Plan */}
                    <Card className="flex flex-col border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                        <CardHeader>
                            <CardTitle>Team</CardTitle>
                            <CardDescription>Collaborate with your organization</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">$49</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {[
                                    "Everything in Pro",
                                    "Team Dashboard",
                                    "Role-based Access",
                                    "API Access",
                                    "Custom Integrations",
                                    "Dedicated Success Manager"
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/contact" className="w-full">
                                <Button variant="outline" className="w-full">Contact Sales</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mt-24">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    <div className="grid gap-6">
                        {[
                            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. You'll keep access until the end of your billing period." },
                            { q: "Do you offer student discounts?", a: "Absolutely! Students get 50% off the Pro plan with a valid .edu email address." },
                            { q: "Is it secure?", a: "We use bank-level encryption and do not store your code permanently. Analysis happens in a secure, ephemeral environment." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-secondary/20 p-6 rounded-lg">
                                <h3 className="font-semibold mb-2">{faq.q}</h3>
                                <p className="text-muted-foreground text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} ProjectCopilot. All rights reserved.</p>
            </footer>
        </div>
    );
}
