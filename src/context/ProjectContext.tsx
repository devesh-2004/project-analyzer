"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AnalyzedProject {
    id: string;
    name: string;
    url: string;
    score: number;
    techStack: string[];
    analyzedAt: string;
    status: "analyzed" | "processing";
}

interface ProjectContextType {
    projects: AnalyzedProject[];
    addProject: (project: AnalyzedProject) => void;
    clearProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<AnalyzedProject[]>([]);

    // Optional: Load from sessionStorage on mount to persist across reload (if desired, but user said "Clear all data on refresh"?)
    // User said: "Clear all data on refresh or logout". So we will NOT use sessionStorage/localStorage.
    // Just simple React state.

    const addProject = (project: AnalyzedProject) => {
        setProjects((prev) => [project, ...prev]);
    };

    const clearProjects = () => {
        setProjects([]);
    };

    return (
        <ProjectContext.Provider value={{ projects, addProject, clearProjects }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProjects must be used within a ProjectProvider");
    }
    return context;
}
