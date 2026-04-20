import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        return NextResponse.json(
            { error: "GitHub credentials not found" },
            { status: 500 }
        );
    }

    try {
        const requestOrigin = new URL(request.url).origin;
        // Use NEXT_PUBLIC_APP_URL if it's explicitly set to a non-localhost domain
        // Otherwise, rely on the actual request origin (which perfectly handles Vercel preview environments and localhost)
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) 
            ? process.env.NEXT_PUBLIC_APP_URL 
            : requestOrigin;
        const REDIRECT_URI = `${appUrl}/api/auth/github/callback`;

        // Exchange code for access token
        const tokenResponse = await fetch(
            "https://github.com/login/oauth/access_token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    client_id: GITHUB_CLIENT_ID,
                    client_secret: GITHUB_CLIENT_SECRET,
                    code,
                    redirect_uri: REDIRECT_URI
                }),
            }
        );

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return NextResponse.json({ error: tokenData.error_description }, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // Fetch user info
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();

        // Fetch user email (often private)
        const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const emails = await emailResponse.json();
        const primaryEmail = Array.isArray(emails)
            ? emails.find((e: any) => e.primary)?.email
            : userData.email || null;

        // Construct user object to pass back to client
        const userPayload = {
            name: userData.name || userData.login,
            email: primaryEmail,
            picture: userData.avatar_url,
            accessToken: accessToken,
            githubToken: accessToken,
        };

        // Redirect to dashboard with user data in query params
        const dashboardUrl = new URL("/dashboard", request.url);
        dashboardUrl.searchParams.set("user", JSON.stringify(userPayload));

        return NextResponse.redirect(dashboardUrl);

    } catch (error) {
        console.error("GitHub Auth Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
