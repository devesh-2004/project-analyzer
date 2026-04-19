"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Github, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
// import googleLogo from "@/assets/google.svg"; // Assumed asset, can use text or icon

export default function LoginPage() {
    const { loginWithGoogle, loginWithGithub, isLoading } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                        <Sparkles className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-semibold">ProjectCopilot</span>
                </Link>

                <Card className="border-border/50 backdrop-blur-sm bg-background/80">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Welcome back</CardTitle>
                        <CardDescription>
                            Log in to continue analyzing your projects
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <Button
                            variant="outline"
                            className="w-full py-6 text-base"
                            onClick={() => loginWithGoogle()}
                            disabled={isLoading}
                        >
                            {/* <img src={googleLogo} alt="Google" className="h-5 w-5 mr-2" /> */}
                            <span className="mr-2">G</span> {/* Placeholder for Google Logo */}
                            Continue with Google
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-background px-2 text-muted-foreground">or</span>
                            </div>
                        </div>

                        <Button
                            variant="default"
                            className="w-full py-6 text-base"
                            onClick={loginWithGithub}
                            disabled={isLoading}
                        >
                            <Github className="h-5 w-5 mr-2" />
                            Continue with GitHub
                        </Button>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            By clicking continue, you agree to our{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
