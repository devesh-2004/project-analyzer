import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthWrapper } from "@/components/GoogleOAuthWrapper";
import { ProjectProvider } from "@/context/ProjectContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI Project Analyzer",
    description: "Analyze and improve your GitHub projects with AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <GoogleOAuthWrapper>
                        <ProjectProvider>
                            <TooltipProvider>
                                {children}
                                <Toaster />
                                <Sonner />
                            </TooltipProvider>
                        </ProjectProvider>
                    </GoogleOAuthWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
