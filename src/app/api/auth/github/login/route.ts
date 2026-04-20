import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isPrivate = searchParams.get("private") === "true";

    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    
    const requestOrigin = new URL(request.url).origin;
    // Use NEXT_PUBLIC_APP_URL if it's explicitly set to a non-localhost domain
    // Otherwise, rely on the actual request origin (which perfectly handles Vercel preview environments and localhost)
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : requestOrigin;
    const REDIRECT_URI = `${appUrl}/api/auth/github/callback`;

    if (!GITHUB_CLIENT_ID) {
        return NextResponse.json(
            { error: "GitHub Client ID not found" },
            { status: 500 }
        );
    }

    const baseScope = "read:user user:email";
    const scope = isPrivate ? `${baseScope} repo` : baseScope;

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;

    return NextResponse.redirect(githubAuthUrl);
}
