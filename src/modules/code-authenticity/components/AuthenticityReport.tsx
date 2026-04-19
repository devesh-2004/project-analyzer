"use client";

import { AuthenticityAnalysisResult } from "../types";
import { motion } from "framer-motion";
import { ShieldAlert, Fingerprint, BrainCircuit, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuthenticityReportProps {
  result: AuthenticityAnalysisResult;
}

export function AuthenticityReport({ result }: AuthenticityReportProps) {
  const isSuspicious = result.score < 70;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 grid gap-8 lg:grid-cols-3">
      {/* Overview and Score */}
      <div className="lg:col-span-1 space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden text-white shadow-xl ${
            isSuspicious ? "bg-gradient-to-br from-destructive to-orange-600" : "bg-gradient-to-br from-success to-emerald-600"
          }`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Fingerprint className="h-32 w-32" />
          </div>
          
          <h2 className="text-xl font-bold mb-6 z-10 flex items-center gap-2">
            {isSuspicious ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
            Authenticity Score
          </h2>
          
          <div className="relative mb-4 z-10 h-32 w-32 flex items-center justify-center rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-md">
             <span className="text-5xl font-black">{result.score}</span>
          </div>
          
          <p className="text-sm text-white/90 font-medium z-10">
            {result.overallAssessment}
          </p>
        </motion.div>
      </div>

      {/* Details columns */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-6 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <h3 className="text-xl font-bold">Pattern Detections</h3>
          </div>

          <div className="space-y-4">
            {(!result.patternWarnings || result.patternWarnings.length === 0) ? (
               <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-success" /> No highly suspicious patterns detected.
               </p>
            ) : (
                (result.patternWarnings || []).map((warning) => (
                    <div key={warning.id} className="p-4 border-l-4 border-warning bg-warning/5 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={warning.severity === "high" ? "destructive" : "secondary"}>
                                {warning.type}
                            </Badge>
                            {warning.fileReference && <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded">{warning.fileReference}</span>}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{warning.description}</p>
                    </div>
                ))
            )}
          </div>
        </motion.div>

        {(result.skillMismatches && result.skillMismatches.length > 0) && (
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                  <BrainCircuit className="h-6 w-6 text-purple-500" />
                  <h3 className="text-xl font-bold">Skill Mismatches</h3>
              </div>
              <ul className="space-y-4">
                  {(result.skillMismatches || []).map((mismatch, idx) => (
                      <li key={idx} className="text-sm">
                          <p className="font-semibold text-foreground mb-1">{mismatch.description}</p>
                          <p className="text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border mt-2">{mismatch.evidence}</p>
                      </li>
                  ))}
              </ul>
            </motion.div>
        )}

        {(result.conceptQuestions && result.conceptQuestions.length > 0) && (
             <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="bg-card border border-border p-6 rounded-2xl shadow-sm"
             >
               <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                   <ShieldAlert className="h-6 w-6 text-primary" />
                   <h3 className="text-xl font-bold">Validation Interview Questions</h3>
               </div>
               <p className="text-sm text-muted-foreground mb-4">Ask the candidate these questions specifically generated from the repository's logic to verify authenticity:</p>
               <div className="space-y-6">
                   {(result.conceptQuestions || []).map((q) => (
                       <div key={q.id}>
                           <p className="font-semibold text-foreground text-sm flex gap-2">
                             <span className="text-primary font-black">Q:</span> {q.question}
                           </p>
                           <p className="text-sm mt-2 flex gap-2">
                             <span className="text-success font-black">A:</span> <span className="text-muted-foreground">{q.expectedAnswer}</span>
                           </p>
                       </div>
                   ))}
               </div>
             </motion.div>
        )}
      </div>
    </div>
  );
}
