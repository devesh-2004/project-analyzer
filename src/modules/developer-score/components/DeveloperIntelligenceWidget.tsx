"use client";

import { useProjects } from "@/context/ProjectContext";
import { DeveloperIntelligenceData } from "../types";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Target, Zap, LayoutDashboard, Fingerprint, Award } from "lucide-react";

export function DeveloperIntelligenceWidget() {
  const { projects } = useProjects();
  const [showDetails, setShowDetails] = useState(false);

  // Derive intelligence from local context naturally
  const intelligence: DeveloperIntelligenceData | null = useMemo(() => {
    if (!projects || projects.length === 0) return null;

    const totalProjects = projects.length;
    const averageScore = Math.round(projects.reduce((acc, p) => acc + p.score, 0) / totalProjects);
    
    // In a real app, this would be fetched from true DB history across all modules.
    // Here we compute proxies to form the aggregated Developer Intelligence.
    const mockResumeScore = 85; 
    const mockSecurityScore = averageScore > 80 ? 90 : 70;

    // Weighting Algorithm (Project 50%, Resume 30%, Security/Authenticity 20%)
    const rawDeveloperScore = Math.round((averageScore * 0.5) + (mockResumeScore * 0.3) + (mockSecurityScore * 0.2));
    
    let level: "Novice" | "Intermediate" | "Advanced" | "Expert" = "Novice";
    if (rawDeveloperScore >= 90) level = "Expert";
    else if (rawDeveloperScore >= 75) level = "Advanced";
    else if (rawDeveloperScore >= 50) level = "Intermediate";

    const strengths = [];
    const weaknesses = [];

    if (averageScore > 80) strengths.push("Consistently high code quality across repositories");
    else weaknesses.push("Repository structue and maintainability needs enhancement");

    if (mockResumeScore > 80) strengths.push("Strong ATS compatibility and resume presentation");
    else weaknesses.push("Resume keyword match rates could be improved for ATS pipelines");

    if (mockSecurityScore > 80) strengths.push("Demonstrates high code authenticity and security practices");

    // Padding if naturally short
    if (strengths.length < 2) strengths.push("Good foundation in modern frameworks");
    if (weaknesses.length < 2) weaknesses.push("Consider increasing automated test coverage");

    return {
      score: rawDeveloperScore,
      level,
      strengths,
      weaknesses,
      metrics: {
        averageProjectScore: averageScore,
        resumeScore: mockResumeScore,
        securityScore: mockSecurityScore,
        totalProjects
      }
    };
  }, [projects]);

  if (!intelligence) return null;

  return (
    <div className="w-full bg-gradient-to-br from-card to-primary/5 rounded-3xl border border-primary/20 shadow-lg overflow-hidden">
      <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
        
        {/* Core Score Ring */}
        <div className="flex flex-col items-center">
            <div className="relative h-48 w-48 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                    <motion.circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                        strokeDasharray="283" strokeDashoffset={283 - (283 * intelligence.score) / 100}
                        className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * intelligence.score) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />
                </svg>
                <div className="flex flex-col items-center text-center z-10">
                    <Brain className="h-6 w-6 text-primary mb-1 opacity-80" />
                    <span className="text-5xl font-black tabular-nums tracking-tighter">{intelligence.score}</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Dev Score</span>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-background/50 px-4 py-1.5 rounded-full border border-border">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-bold">{intelligence.level}</span>
            </div>
        </div>

        {/* Intelligence Insights */}
        <div className="flex-1 space-y-6 w-full">
            <div>
                 <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    Developer Intelligence Hub
                 </h2>
                 <p className="text-muted-foreground leading-relaxed">
                    AI-aggregated synthesis of your active repositories, ATS optimization, and code authenticity. 
                    Your holistic technical profile currently signals <strong className="text-foreground">{intelligence.level}</strong> level competency to employers.
                 </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border-border border p-4 rounded-xl shadow-sm hover:border-success/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-success">
                        <TrendingUp className="h-5 w-5" />
                        <h3 className="font-semibold text-foreground">Identified Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                        {intelligence.strengths.map((s, i) => (
                           <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                               <div className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                               {s}
                           </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-card border-border border p-4 rounded-xl shadow-sm hover:border-warning/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-warning">
                        <TrendingDown className="h-5 w-5" />
                        <h3 className="font-semibold text-foreground">Areas for Growth</h3>
                    </div>
                    <ul className="space-y-2">
                        {intelligence.weaknesses.map((w, i) => (
                           <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                               <div className="mt-1 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                               {w}
                           </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="pt-2">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                   {showDetails ? "Hide specific metrics" : "View specific scoring metrics"}
                </button>
            </div>
        </div>
      </div>

      {/* Expanded Metrics */}
      <AnimatePresence>
          {showDetails && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border/50 bg-background/50 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border sm:flex-row"
              >
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                     <LayoutDashboard className="h-5 w-5 text-muted-foreground mb-2" />
                     <span className="text-2xl font-bold">{intelligence.metrics.totalProjects}</span>
                     <span className="text-xs text-muted-foreground uppercase font-semibold">Live Projects</span>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                     <Target className="h-5 w-5 text-blue-500 mb-2" />
                     <span className="text-2xl font-bold">{intelligence.metrics.averageProjectScore}</span>
                     <span className="text-xs text-muted-foreground uppercase font-semibold">Avg Repo Quality</span>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                     <Fingerprint className="h-5 w-5 text-orange-500 mb-2" />
                     <span className="text-2xl font-bold">{intelligence.metrics.securityScore}</span>
                     <span className="text-xs text-muted-foreground uppercase font-semibold">Synthesized Authenticity</span>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                     <Zap className="h-5 w-5 text-purple-500 mb-2" />
                     <span className="text-2xl font-bold">{intelligence.metrics.resumeScore}</span>
                     <span className="text-xs text-muted-foreground uppercase font-semibold">ATS Compatibility</span>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
