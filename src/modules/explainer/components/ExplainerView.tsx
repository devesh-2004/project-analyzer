"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProjectExplanationResult } from "../types";
import { Loader2, BookOpen, Layers, GitMerge, FolderTree, FileCode2 } from "lucide-react";

interface ExplainerViewProps {
    repoUrl: string;
}

export function ExplainerView({ repoUrl }: ExplainerViewProps) {
    const [data, setData] = useState<ProjectExplanationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateExplanation = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/v2/project/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl })
            });
            if (!res.ok) throw new Error("Failed to generate explanation");
            setData(await res.json());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!data && !loading && !error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-indigo-500" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold">Explain This Project</h2>
                   <p className="text-muted-foreground max-w-md mt-2">
                       Ask Gemini to recursively traverse the files and extract a human-readable roadmap of how this repository functions.
                   </p>
                </div>
                <button
                    onClick={generateExplanation}
                    className="px-6 py-3 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                >
                   Generate AI Breakdown
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {loading && (
                <div className="flex items-center justify-center py-20">
                   <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}
            
            {data && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Overview Panel */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 backdrop-blur-sm">
                       <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-500 mb-3">
                           <BookOpen className="h-5 w-5" /> Executive Overview
                       </h3>
                       <p className="text-foreground leading-relaxed text-lg">{data.overview}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Architecture */}
                        <div className="p-6 rounded-xl bg-card border border-border">
                           <h3 className="flex items-center gap-2 font-semibold mb-3 text-muted-foreground">
                               <Layers className="h-4 w-4" /> System Architecture
                           </h3>
                           <p className="leading-relaxed">{data.architecture}</p>
                        </div>
                        {/* Data Flow */}
                        <div className="p-6 rounded-xl bg-card border border-border">
                           <h3 className="flex items-center gap-2 font-semibold mb-3 text-muted-foreground">
                               <GitMerge className="h-4 w-4" /> Data Flow Pipeline
                           </h3>
                           <p className="leading-relaxed">{data.dataFlow}</p>
                        </div>
                    </div>

                    {/* Folder Structure */}
                    <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                        <h3 className="flex items-center gap-2 font-semibold text-muted-foreground">
                            <FolderTree className="h-4 w-4" /> Folder Structure Explanation
                        </h3>
                        <div className="grid gap-3">
                            {data.folderStructureExplanation.map((folder: any, i: number) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 bg-secondary/30 p-3 rounded-lg">
                                    <span className="font-mono text-sm text-indigo-400 font-semibold shrink-0">{folder.folderName}/</span>
                                    <span className="text-sm text-muted-foreground">{folder.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Files */}
                    <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                        <h3 className="flex items-center gap-2 font-semibold text-muted-foreground">
                            <FileCode2 className="h-4 w-4" /> Architectural Master Files
                        </h3>
                        <div className="grid gap-3">
                            {data.keyFiles.map((file: any, i: number) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 border-l-2 border-indigo-500/50 pl-4 py-1">
                                    <span className="font-mono text-sm text-foreground shrink-0">{file.path}</span>
                                    <span className="text-sm text-muted-foreground">{file.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
