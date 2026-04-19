"use client";

import { ATSAnalysisResult, ImprovementSuggestion } from "../types";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase, FileText, CheckCircle2, XCircle, ChevronRight, Zap } from "lucide-react";

interface ResumeResultsProps {
  result: ATSAnalysisResult;
}

export function ResumeResults({ result }: ResumeResultsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-12 grid gap-8 lg:grid-cols-3">
      {/* Left Column: Scores & Match Rate */}
      <div className="lg:col-span-1 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="h-32 w-32" />
          </div>
          
          <h2 className="text-xl font-semibold mb-6 z-10">ATS Compatibility Score</h2>
          
          <div className="score-ring shadow-2xl relative mb-4 z-10" style={{ "--progress": result.score, "--size": "160px", "--stroke-width": "12px" } as React.CSSProperties}>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tracking-tighter">{result.score}</span>
              <span className="text-sm text-muted-foreground mt-1">/ 100</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 z-10">
            {result.score >= 80 ? "Excellent ATS parsing capability!" : 
             result.score >= 60 ? "Good, but some ATS parsers might miss details." :
             "Needs significant formatting and keyword optimization."}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Keyword Match Rate</h3>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${result.keywordMatchRate}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-full bg-primary"
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>0%</span>
            <span className="font-bold text-foreground">{result.keywordMatchRate}% match</span>
            <span>100%</span>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Insights & Suggestions */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Extracted Profile</h3>
          </div>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {result.summary}
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="flex items-center text-sm font-semibold text-success mb-3 gap-2">
                <CheckCircle2 className="h-4 w-4" /> Detected Strengths
              </h4>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex gap-2 text-muted-foreground">
                    <span className="text-success mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="flex items-center text-sm font-semibold text-destructive mb-3 gap-2">
                <XCircle className="h-4 w-4" /> Notable Weaknesses
              </h4>
              <ul className="space-y-2">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm flex gap-2 text-muted-foreground">
                    <span className="text-destructive mt-0.5">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Actionable Improvements</h3>
          </div>

          <div className="space-y-4">
            {result.improvements.map((imp, idx) => (
              <div key={imp.id} className="p-4 border border-border rounded-xl hover:bg-secondary/10 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs uppercase px-2 py-0">{imp.category}</Badge>
                      <h4 className="font-semibold text-foreground">{imp.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      {imp.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
