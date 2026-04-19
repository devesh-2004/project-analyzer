"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
            <div className="bg-destructive/10 p-4 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping opacity-20"></div>
                <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                We encountered an unexpected error. Our team has been notified.
                Please try refreshing the page or try again later.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => window.location.href = "/dashboard"} variant="outline">
                    Return Home
                </Button>
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </div>
        </div>
    );
}
