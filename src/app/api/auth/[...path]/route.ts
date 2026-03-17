import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;
    const path = params.path.join("/");

    try {
        const headers: Record<string, string> = {};

        // Forward Authorization header if present
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        const response = await fetch(`${BE_API_URL}/auth/${path}`, {
            method: "GET",
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("API Proxy GET Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;
    const path = params.path.join("/");

    try {
        const body = await req.json();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        const response = await fetch(`${BE_API_URL}/auth/${path}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("API Proxy PUT Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

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

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        // Forward Authorization header for authenticated routes (change-password, etc.)
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        // Forward request to the actual backend
        const response = await fetch(`${BE_API_URL}/auth/${path}`, {
            method: "POST",
            headers,
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
        }

        // If it's a logout, clear cookies
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
