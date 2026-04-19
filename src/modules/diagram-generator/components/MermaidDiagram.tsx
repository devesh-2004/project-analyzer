"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Loader2, AlertCircle } from "lucide-react";

interface MermaidDiagramProps {
  repoUrl: string;
}

export function MermaidDiagram({ repoUrl }: MermaidDiagramProps) {
  const [diagramDefinition, setDiagramDefinition] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark", // Using dark theme since app is predominantly dark
      securityLevel: "loose",
      fontFamily: "Inter, sans-serif"
    });
  }, []);

  const generateDiagram = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v2/diagram/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      if (!res.ok) throw new Error("Failed to generate diagram");
      const data = await res.json();
      setDiagramDefinition(data.diagram);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diagramDefinition && containerRef.current) {
        // Clear previous diagram
        containerRef.current.innerHTML = "";
        // Render new
        mermaid.render('mermaid-chart', diagramDefinition).then((result) => {
            if (containerRef.current) {
                containerRef.current.innerHTML = result.svg;
            }
        }).catch(err => {
            console.error("Mermaid Render Error", err);
            setError("Failed to render the conceptual diagram.");
        });
    }
  }, [diagramDefinition]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl">
      {!diagramDefinition && !loading && !error && (
        <div className="text-center py-6">
           <p className="text-muted-foreground mb-4">Click below to command Gemini to architect a system map based on this repo's structure.</p>
           <button 
             onClick={generateDiagram} 
             className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
           >
             Generate Architecture Diagram
           </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="animate-pulse font-medium text-sm">Synthesizing file structures down to root architectural nodes...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive py-6 bg-destructive/10 rounded-xl px-4 border border-destructive/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div 
        ref={containerRef} 
        className={`w-full overflow-x-auto flex justify-center py-4 ${diagramDefinition ? "block" : "hidden"}`} 
      />
    </div>
  );
}
