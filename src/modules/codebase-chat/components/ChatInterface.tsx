"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Code2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface ChatInterfaceProps {
  repoUrl: string;
}

export function ChatInterface({ repoUrl }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    
    const newContext = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newContext);
    setLoading(true);

    try {
        const res = await fetch("/api/v2/project/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoUrl, message: userMessage, history: messages })
        });
        
        if (!res.ok) throw new Error("Failed to get reply");
        const data = await res.json();
        
        setMessages([...newContext, { role: "model", content: data.reply }]);
    } catch (err: any) {
        setMessages([...newContext, { role: "model", content: `Error: ${err.message}` }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] max-h-[800px] border border-border/50 rounded-2xl bg-card shadow-xl overflow-hidden relative">
       {/* Background glow base */}
       <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
       
       <div className="p-4 border-b border-border/50 flex flex-col bg-background/50 backdrop-blur-md z-10">
          <h3 className="font-bold flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> Codebase AI Mentor
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Ask anything about modules, architecture, or code intent in this repository.</p>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10" ref={scrollRef}>
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                 <Code2 className="h-10 w-10 mb-4 text-muted-foreground" />
                 <p className="text-sm">Context is actively locked onto <span className="font-mono text-primary">{repoUrl}</span></p>
                 <p className="text-xs text-muted-foreground mt-2 max-w-xs block">"How is authentication handled?"<br/>"Where are the database models?"</p>
             </div>
          )}
          
          <AnimatePresence initial={false}>
             {messages.map((msg, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                 className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
               >
                 <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-500 border border-blue-500/30"}`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                 </div>
                 <div className={`p-4 rounded-xl text-sm leading-relaxed max-w-[85%] ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-secondary text-secondary-foreground rounded-tl-none border border-border/50"}`}>
                    {/* Basic newline parsing for mock markdown */}
                    {msg.content.split('\n').map((line, idx) => (
                        <p key={idx} className={line.startsWith('-') ? "ml-4" : ""}>{line}</p>
                    ))}
                 </div>
               </motion.div>
             ))}
             {loading && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
                     <div className="shrink-0 h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 flex items-center justify-center">
                         <Loader2 className="h-4 w-4 animate-spin" />
                     </div>
                     <div className="p-4 rounded-xl bg-secondary text-secondary-foreground rounded-tl-none border border-border/50 text-sm">
                         Synthesizing codebase logic...
                     </div>
                 </motion.div>
             )}
          </AnimatePresence>
       </div>

       <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-md z-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Chat with your architecture..."
               className="w-full bg-secondary/50 border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
             />
             <button 
               type="submit" 
               disabled={!input.trim() || loading}
               className="absolute right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-opacity"
             >
                <Send className="h-4 w-4 shrink-0 -ml-0.5" />
             </button>
          </form>
       </div>
    </div>
  );
}
