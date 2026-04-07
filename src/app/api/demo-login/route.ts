import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { role } = await request.json();

  if (role !== "advertiser" && role !== "influencer") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("adlumin_demo", role, {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: false,
    sameSite: "lax",
  });
  return res;
}
