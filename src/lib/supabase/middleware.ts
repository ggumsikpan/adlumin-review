import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // --- Demo mode handling ---
  const demoCookie = request.cookies.get("adlumin_demo")?.value;
  if (demoCookie === "advertiser" || demoCookie === "influencer") {
    const protectedPaths = ["/influencer", "/advertiser", "/admin"];
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

    // Demo user on auth pages → redirect to their dashboard
    if (pathname === "/login" || pathname.startsWith("/register")) {
      const url = request.nextUrl.clone();
      url.pathname = demoCookie === "advertiser" ? "/advertiser" : "/influencer";
      return NextResponse.redirect(url);
    }

    // Demo user accessing protected routes
    if (isProtected) {
      // Wrong role → redirect to correct dashboard
      if (pathname.startsWith("/admin")) {
        const url = request.nextUrl.clone();
        url.pathname = demoCookie === "advertiser" ? "/advertiser" : "/influencer";
        return NextResponse.redirect(url);
      }
      if (pathname.startsWith("/influencer") && demoCookie !== "influencer") {
        return NextResponse.redirect(new URL("/advertiser", request.url));
      }
      if (pathname.startsWith("/advertiser") && demoCookie !== "advertiser") {
        return NextResponse.redirect(new URL("/influencer", request.url));
      }
      // Correct role → allow through
      return NextResponse.next({ request });
    }

    // Public pages are fine for demo users
    return NextResponse.next({ request });
  }

  // --- Normal auth flow ---
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ["/influencer", "/advertiser", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === "/login" || pathname.startsWith("/register"))) {
    // Fetch user role to redirect to correct dashboard
    const { data: profile } = await supabase
      .from("review_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (profile?.role === "advertiser") {
      url.pathname = "/advertiser";
    } else if (profile?.role === "influencer") {
      url.pathname = "/influencer";
    } else if (profile?.role === "admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/";
    }
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("review_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (pathname.startsWith("/influencer") && role !== "influencer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/advertiser") && role !== "advertiser") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}
