import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
            <div className="bg-primary/10 p-4 rounded-full mb-6">
                <FileQuestion className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link href="/dashboard">
                <Button>Return to Dashboard</Button>
            </Link>
        </div>
    );
}
