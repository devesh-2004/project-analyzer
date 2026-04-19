"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useProjects } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_QUESTIONS = [
    "Why is my security score low?",
    "How can I improve scalability?",
    "What should I fix first?",
    "Is this project resume-ready?"
];

const MAX_QUESTIONS = 5;

export default function ChatPage() {
    const { projects } = useProjects();
    const { user } = useAuth();
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Default to the first project if available
    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const handleSend = async () => {
        if (!input.trim() || !selectedProject || questionCount >= MAX_QUESTIONS) return;

        const userMessage = { role: "user" as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setQuestionCount(prev => prev + 1);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    projectContext: selectedProject
                }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (projects.length === 0) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
                    <div className="bg-secondary/20 p-4 rounded-full">
                        <Bot className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">No Projects Analyzed Yet</h2>
                    <p className="text-muted-foreground max-w-md">
                        Analyze a GitHub repository first to start chatting with the AI about your code.
                    </p>
                    <Link href="/submit">
                        <Button>Analyze a Project</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">

                {/* Header / Project Selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            AI Chat
                        </h1>
                        <p className="text-muted-foreground">Ask questions about your codebase</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Badge variant="outline" className={questionCount >= MAX_QUESTIONS ? "text-destructive border-destructive" : ""}>
                            {MAX_QUESTIONS - questionCount} Qs Left
                        </Badge>
                    </div>
                </div>

                {/* Chat Area */}
                <Card className="flex-1 flex flex-col overflow-hidden border-2">
                    <CardContent className="flex-1 flex flex-col p-0">

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 sm:p-6">
                            <div className="space-y-6">
                                {/* Welcome Message */}
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="bg-secondary/10 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                                        <p className="text-sm">
                                            Hello! I'm your AI Architect. I've analyzed <strong>{selectedProject?.name}</strong>.
                                            Ask me anything about the code quality, security, or how to improve it!
                                        </p>
                                    </div>
                                </div>

                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 
                                            ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                                            {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl max-w-[80%] text-sm
                                            ${msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-secondary/10 rounded-tl-none"}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Bot className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="bg-secondary/10 p-4 rounded-2xl rounded-tl-none">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-background">

                            {/* Suggested Chips */}
                            {messages.length === 0 && questionCount === 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {SUGGESTED_QUESTIONS.map(q => (
                                        <Button
                                            key={q}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full text-xs"
                                            onClick={() => {
                                                setInput(q);
                                                // Ideally auto-send, but let's just fill input for user review
                                            }}
                                        >
                                            {q}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {questionCount >= MAX_QUESTIONS ? (
                                <div className="flex items-center justify-center p-3 bg-secondary/20 rounded-lg text-muted-foreground gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Free chat limit reached for this session.</span>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type your question..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={isLoading}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                AI can make mistakes. Review the analysis results for details.
                            </p>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
