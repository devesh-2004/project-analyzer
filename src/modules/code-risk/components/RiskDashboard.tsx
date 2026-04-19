"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiskAnalysisResult, CodeRisk } from "../types";
import { Loader2, ShieldAlert, ShieldCheck, AlertTriangle, Info, TerminalSquare } from "lucide-react";

interface RiskDashboardProps {
    repoUrl: string;
}

export function RiskDashboard({ repoUrl }: RiskDashboardProps) {
    const [data, setData] = useState<RiskAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkRisks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/v2/code/risk-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl })
            });
            if (!res.ok) throw new Error("Failed to scan project risks");
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
                <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold">Vulnerability & Bad Practice Scan</h2>
                   <p className="text-muted-foreground max-w-md mt-2">
                       Conduct a ruthless deep-scan of the repository hunting for missing validation layers, hardcoded secrets, and inefficient big-O structures. 
                   </p>
                </div>
                <button
                    onClick={checkRisks}
                    className="mt-4 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex gap-2 items-center"
                >
                   Execute Deep Scan
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-red-500 space-y-4">
                   <Loader2 className="h-10 w-10 animate-spin" />
                   <p className="animate-pulse text-sm font-mono">Running AST rules and pattern matching overrides...</p>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}
            
            {data && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    
                    {/* Health Status Block */}
                    <div className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl shadow-sm">
                       <div>
                           <h3 className="text-lg font-bold">Overall Defect Health</h3>
                           <p className="text-sm text-muted-foreground mt-1">A strictly calculated scale of architectural resilience.</p>
                       </div>
                       <div className="flex items-center gap-3">
                           {data.healthScore >= 80 ? <ShieldCheck className="h-8 w-8 text-green-500" /> : <ShieldAlert className="h-8 w-8 text-red-500" />}
                           <span className={`text-4xl font-black ${data.healthScore >= 80 ? "text-green-500" : data.healthScore >= 50 ? "text-orange-500" : "text-red-500"}`}>
                               {data.healthScore}<span className="text-xl text-muted-foreground opacity-50">/100</span>
                           </span>
                       </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-2">
                           <AlertTriangle className="h-5 w-5 text-orange-500" /> Detected Attack Vectors & Structural Flaws
                        </h3>
                        {data.risks.length === 0 ? (
                           <div className="p-8 text-center text-success border border-success/20 bg-success/5 rounded-2xl">
                               Code is pristine. No major detectable risks discovered.
                           </div>
                        ) : (
                           <div className="grid gap-4">
                              {data.risks.map((risk: CodeRisk, i: number) => (
                                  <motion.div 
                                     initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                     key={i} 
                                     className="bg-card border border-border rounded-xl p-5 hover:border-red-500/30 transition-colors"
                                  >
                                     <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            {risk.severity === "high" ? <ShieldAlert className="h-4 w-4 text-red-500" /> : 
                                             risk.severity === "medium" ? <AlertTriangle className="h-4 w-4 text-orange-500" /> : 
                                             <Info className="h-4 w-4 text-blue-500" />}
                                            <span className={`text-xs font-bold uppercase tracking-wider ${risk.severity === 'high' ? 'text-red-500' : risk.severity === 'medium' ? 'text-orange-500' : 'text-blue-500'}`}>
                                                {risk.severity} Severity
                                            </span>
                                        </div>
                                        {risk.fileReference && (
                                            <div className="flex gap-1 items-center bg-secondary/50 px-2 py-1 rounded text-xs font-mono text-muted-foreground">
                                                <TerminalSquare className="h-3 w-3" /> {risk.fileReference}
                                            </div>
                                        )}
                                     </div>
                                     <p className="text-foreground font-medium mb-2">{risk.description}</p>
                                     {risk.recommendation && (
                                         <div className="mt-4 pt-3 border-t border-border/50 text-sm">
                                             <strong className="text-muted-foreground block mb-1">Mitigation Plan:</strong>
                                             <p className="text-muted-foreground">{risk.recommendation}</p>
                                         </div>
                                     )}
                                  </motion.div>
                              ))}
                           </div>
                        )}
                    </div>

                </motion.div>
            )}
        </div>
    );
}
