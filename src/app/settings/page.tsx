"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Github, Lock, User } from "lucide-react";

export default function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Account Profile
                        </CardTitle>
                        <CardDescription>Your connected GitHub account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <img
                                src={user?.picture || "/placeholder-user.jpg"}
                                alt={user?.name || "User"}
                                className="h-16 w-16 rounded-full border border-border"
                            />
                            <div>
                                <h3 className="font-semibold text-lg">{user?.name}</h3>
                                <p className="text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Github className="h-5 w-5" />
                            GitHub Connection
                        </CardTitle>
                        <CardDescription>Manage repository access permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/10">
                            <div>
                                <p className="font-medium">Private Repository Access</p>
                                <p className="text-sm text-muted-foreground">
                                    Allow access to your private repositories for analysis
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = "/api/auth/github/login?private=true"}
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                {user?.githubToken ? "Reconnect / Update Permissions" : "Enable Private Access"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button variant="destructive" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
