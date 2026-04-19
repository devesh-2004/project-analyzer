"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Clock } from "lucide-react";

export default function ReportsPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-muted-foreground">Generate and download comprehensive PDF reports</p>
                </div>

                <Card className="bg-secondary/10 border-dashed">
                    <CardContent className="py-20 text-center space-y-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Coming Soon</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We are working on advanced reporting features including consolidated PDF exports, team sharing, and historical trend analysis.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
