"use client";

import { PublicNavbar } from "@/components/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Message sent! We'll get back to you soon.");
        setIsSubmitting(false);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="min-h-screen bg-background relative">
            <PublicNavbar />

            <div className="absolute inset-0 bg-dotted-pattern opacity-5 pointer-events-none" />

            <main className="container mx-auto px-4 pt-32 pb-20">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">

                    {/* Contact Info */}
                    <div className="space-y-8 animate-fade-in-right">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Get in touch</h1>
                            <p className="text-xl text-muted-foreground">
                                Have questions about ProjectCopilot? We're here to help you build better software.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Email Support</h3>
                                    <p className="text-sm text-muted-foreground mb-1">Our team typically responds within 24 hours.</p>
                                    <a href="mailto:deveshpurohit275@gmail.com" className="text-primary hover:underline">deveshpurohit275@gmail.com</a>
                                </div>
                            </div>



                        </div>

                        <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50">
                            <h3 className="font-semibold mb-2">Looking for collaboration?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Let's build something amazing together.
                            </p>
                            <Button asChild variant="default" size="sm">
                                <a href="https://devesh-purohit-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer">
                                    Portfolio
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <Card className="animate-fade-in-up border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Send us a message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll get back to you as soon as possible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="first-name" className="text-sm font-medium">First name</label>
                                        <Input id="first-name" placeholder="Jane" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="last-name" className="text-sm font-medium">Last name</label>
                                        <Input id="last-name" placeholder="Doe" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input id="email" type="email" placeholder="jane@example.com" required />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                    <Input id="subject" placeholder="How can we help?" required />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us more about your inquiry..."
                                        className="min-h-[150px]"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
