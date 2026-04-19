"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UnderstandingTest, UnderstandingEvaluation } from "../types";
import { Loader2, GraduationCap, CheckCircle2, XCircle, ChevronRight, RefreshCcw } from "lucide-react";

interface QuizInterfaceProps {
    repoUrl: string;
}

export function QuizInterface({ repoUrl }: QuizInterfaceProps) {
    // Mode states: 'intro' -> 'generating' -> 'taking' -> 'evaluating' -> 'results'
    const [mode, setMode] = useState<"intro" | "generating" | "taking" | "evaluating" | "results">("intro");
    
    const [testData, setTestData] = useState<UnderstandingTest | null>(null);
    const [answers, setAnswers] = useState<{questionId: string, answer: string}[]>([]);
    const [evaluation, setEvaluation] = useState<UnderstandingEvaluation | null>(null);
    
    // Test taking tracking
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentInput, setCurrentInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    const generateQuiz = async () => {
        setMode("generating");
        setError(null);
        try {
            const res = await fetch("/api/v2/project/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl, action: "generate" })
            });
            if (!res.ok) throw new Error("Failed to generate test");
            const data: UnderstandingTest = await res.json();
            setTestData(data);
            setMode("taking");
            setCurrentQuestionIndex(0);
            setAnswers([]);
        } catch (err: any) {
            setError(err.message);
            setMode("intro");
        }
    };

    const submitAnswerAndContinue = () => {
        if (!testData || !currentInput.trim()) return;
        const currentQ = testData.questions[currentQuestionIndex];
        
        const newAnswers = [...answers, { questionId: currentQ.id, answer: currentInput }];
        setAnswers(newAnswers);
        setCurrentInput("");

        if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finalizeTest(newAnswers);
        }
    };

    const finalizeTest = async (finalAnswers: typeof answers) => {
        if (!testData) return;
        setMode("evaluating");
        try {
            const res = await fetch("/api/v2/project/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "submit", 
                    answers: finalAnswers, 
                    originalQuestions: testData.questions 
                })
            });
            if (!res.ok) throw new Error("Failed to evaluate test");
            const data: UnderstandingEvaluation = await res.json();
            setEvaluation(data);
            setMode("results");
        } catch (err: any) {
            setError(err.message);
            setMode("taking");
        }
    };

    return (
        <div className="max-w-3xl mx-auto border border-border/50 rounded-3xl bg-card shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col">
            {error && (
                <div className="absolute top-0 left-0 right-0 p-3 bg-red-500 text-white text-sm text-center z-50">
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* Intro Screen */}
                {mode === "intro" && (
                    <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20 mb-6">
                            <GraduationCap className="h-12 w-12 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-3">AI Understanding Auditor</h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                            We will dynamically generate 3 extremely specific architectural and logical questions about <span className="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded">{repoUrl.split('/').pop()}</span>. Prove you really wrote it.
                        </p>
                        <button onClick={generateQuiz} className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full shadow-xl hover:scale-105 hover:bg-primary/90 transition-all">
                            Initialize Technical Quiz
                        </button>
                    </motion.div>
                )}

                {/* Loading State generated/evaluating */}
                {(mode === "generating" || mode === "evaluating") && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="text-xl font-medium animate-pulse">
                            {mode === "generating" ? "Scanning codebase & formulating targeted questions..." : "AI parsing responses & validating logic..."}
                        </p>
                    </motion.div>
                )}

                {/* Questionnaire */}
                {mode === "taking" && testData && (
                    <motion.div key="taking" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col p-8 md:p-12">
                         <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-4">
                             <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                 Question {currentQuestionIndex + 1} of {testData.questions.length}
                             </div>
                             <div className="flex gap-2">
                                 {testData.questions.map((_: any, i: number) => (
                                     <div key={i} className={`h-2 rounded-full transition-all ${i <= currentQuestionIndex ? "w-8 bg-primary" : "w-4 bg-secondary"}`} />
                                 ))}
                             </div>
                         </div>

                         <div className="flex-1">
                             <h3 className="text-2xl font-semibold leading-relaxed mb-6">
                                 {testData.questions[currentQuestionIndex].question}
                             </h3>
                             {testData.questions[currentQuestionIndex].hints?.length > 0 && (
                                 <div className="mb-6 p-4 bg-secondary/30 rounded-lg text-sm text-muted-foreground border-l-2 border-primary/50">
                                     <strong>Hint:</strong> {testData.questions[currentQuestionIndex].hints[0]}
                                 </div>
                             )}

                             <textarea 
                                 value={currentInput}
                                 onChange={(e) => setCurrentInput(e.target.value)}
                                 className="w-full bg-background border border-border rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                 placeholder="Explain the architectural logic in detail..."
                                 autoFocus
                             />
                         </div>

                         <div className="flex justify-end mt-8">
                             <button 
                                onClick={submitAnswerAndContinue}
                                disabled={!currentInput.trim()}
                                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                             >
                                 {currentQuestionIndex === testData.questions.length - 1 ? "Submit Final Answers" : "Next Question"} <ChevronRight className="h-4 w-4" />
                             </button>
                         </div>
                    </motion.div>
                )}

                {/* Results Screen */}
                {mode === "results" && evaluation && (
                    <motion.div key="results" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col p-8 md:p-12 bg-gradient-to-br from-card to-background">
                         <div className="text-center mb-10 pb-8 border-b border-border/50">
                             <h2 className="text-3xl font-black mb-2">Evaluation Complete</h2>
                             <div className="flex items-center justify-center gap-4 mt-6">
                                 <div className="text-center">
                                     <span className="block text-4xl font-bold text-primary">{evaluation.score}%</span>
                                     <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Understanding Match</span>
                                 </div>
                             </div>
                         </div>

                         <div className="space-y-6 flex-1 overflow-y-auto">
                             {evaluation.feedback.map((fb: any, i: number) => (
                                 <div key={i} className={`p-5 rounded-2xl border ${fb.isCorrect ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}>
                                      <div className="flex gap-3">
                                          {fb.isCorrect ? <CheckCircle2 className="h-6 w-6 text-success shrink-0" /> : <XCircle className="h-6 w-6 text-destructive shrink-0" />}
                                          <div>
                                              {/* Back-mapping the question text roughly */}
                                              <p className="font-medium text-foreground mb-2">Q: {testData?.questions.find((q: any) => q.id === fb.questionId)?.question || fb.questionId}</p>
                                              <div className="text-sm text-muted-foreground leading-relaxed">
                                                  {fb.explanation}
                                              </div>
                                          </div>
                                      </div>
                                 </div>
                             ))}
                         </div>
                         
                         <div className="mt-8 flex justify-center pt-6 border-t border-border/50">
                             <button onClick={() => setMode("intro")} className="flex items-center gap-2 text-primary font-medium hover:underline">
                                 <RefreshCcw className="h-4 w-4" /> Start Next Audit Validation
                             </button>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
