import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;
    const path = params.path.join("/");

    try {
        let body = {};
        try {
            body = await req.json();
        } catch {
            // No body (e.g., logout request)
        }

        // Forward login request to the actual backend
        const response = await fetch(`${BE_API_URL}/auth/${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // Setup successful response
        const res = NextResponse.json(data);

        // If login is successful, set the cookie containing the token
        if (path === "login" && data.token) {
            res.cookies.set({
                name: "auth_token",
                value: data.token,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60, // 7 Days
            });
            // We can optionally clear the token from the payload here so
            // it doesn't even enter the client-side JavaScript memory
        }

        // If it's a logout (though usually we handle logout internally, 
        // we can still catch an auth/logout request and clear cookies)
        if (path === "logout") {
            res.cookies.delete("auth_token");
        }

        return res;
    } catch (error) {
        console.error("API Proxy Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
