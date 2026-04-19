"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ATSAnalysisResult } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeUploadAreaProps {
  onAnalysisComplete: (result: ATSAnalysisResult) => void;
}

export function ResumeUploadArea({ onAnalysisComplete }: ResumeUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are currently supported for accuracy.");
      setFile(null);
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const analyzeResume = async () => {
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      const base64Pdf = await convertToBase64(file);

      const response = await fetch("/api/v2/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64Pdf }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const result: ATSAnalysisResult = await response.json();
      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-border hover:bg-secondary/20"
        } ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Upload your Resume</h3>
                <p className="text-muted-foreground mt-2">
                  Drag and drop your PDF here, or click to browse
                </p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-4">
                Browse Files
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg shadow-sm w-full max-w-sm">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 text-left overflow-hidden">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isAnalyzing}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>

              <Button size="lg" onClick={analyzeResume} disabled={isAnalyzing} className="w-full max-w-sm">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning against ATS parameters...
                  </>
                ) : (
                  "Analyze Resume ATS Score"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 border border-destructive/50 bg-destructive/10 rounded-lg flex items-center gap-3 text-destructive"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}
    </div>
  );
}
