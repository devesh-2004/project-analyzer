"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";

// Use environment variable or fallback for development
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "667242645336-p24hbid6nacpit17kvpvr2v1230lfdug.apps.googleusercontent.com";

export function GoogleOAuthWrapper({ children }: { children: React.ReactNode }) {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
    );
}
