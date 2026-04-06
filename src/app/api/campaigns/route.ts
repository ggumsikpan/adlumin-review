import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET - List campaigns (public)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const type = searchParams.get("type");
  const channel = searchParams.get("channel");
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "active";
  const search = searchParams.get("search");

  const supabase = createAdminClient();

  let query = supabase
    .from("review_campaigns")
    .select(
      `*, category:review_categories(*), advertiser:review_advertiser_profiles(*)`,
      { count: "exact" }
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (type) query = query.eq("campaign_type", type);
  if (channel) query = query.eq("required_channel", channel);
  if (category) query = query.eq("category_id", parseInt(category));
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    campaigns: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST - Create campaign (advertiser only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("review_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "advertiser") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("review_campaigns")
    .insert({
      ...body,
      advertiser_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
