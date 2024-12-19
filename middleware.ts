import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "./utils/supabase/server";

export async function middleware(request: NextRequest) {
    const res = NextResponse.next();
    const supabase = await createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // If there's no session and the user is trying to access a protected route
    if (!session && request.nextUrl.pathname.startsWith("/cms")) {
        const redirectUrl = new URL("/login", request.url);
        return NextResponse.redirect(redirectUrl);
    }

    // If there's a session and the user is on the login page
    if (session && request.nextUrl.pathname === "/login") {
        const redirectUrl = new URL("/cms/settings", request.url);
        return NextResponse.redirect(redirectUrl);
    }

    return res;
}

export const config = {
    matcher: ["/cms/:path*", "/login"],
}; 