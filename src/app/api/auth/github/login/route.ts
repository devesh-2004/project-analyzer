import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isPrivate = searchParams.get("private") === "true";

    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    
    // Dynamically generate the callback URL based on the environment (localhost vs vercel)
    const url = new URL(request.url);
    const REDIRECT_URI = `${url.origin}/api/auth/github/callback`;

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
