"use client";

import { useState } from "react";
import { ResumeUploadArea } from "@/modules/resume-analyzer/components/ResumeUploadArea";
import { ResumeResults } from "@/modules/resume-analyzer/components/ResumeResults";
import { ATSAnalysisResult } from "@/modules/resume-analyzer/types";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeAnalyzerPage() {
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <Badge variant="outline" className="mb-4 bg-background">
          <FileText className="h-3 w-3 mr-2 text-primary" /> Resume Analyzer
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight mb-2">ATS Resume Optimizer</h1>
        <p className="text-muted-foreground max-w-2xl">
          Upload your resume in PDF format to receive a comprehensive ATS compatibility score, extracted insights, and actionable steps to improve your chances of passing screening systems.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
             key="upload-area"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
          >
             <ResumeUploadArea onAnalysisComplete={setResult} />
          </motion.div>
        ) : (
          <motion.div
             key="results-area"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
          >
             <div className="flex justify-end mb-4">
               <button 
                 onClick={() => setResult(null)}
                 className="text-sm text-primary hover:underline"
               >
                 Analyze another resume
               </button>
             </div>
             <ResumeResults result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
