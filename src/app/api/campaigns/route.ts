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

  // Extract known fields to prevent injection of unwanted fields
  const campaignData: Record<string, unknown> = {
    advertiser_id: user.id,
    title: body.title,
    description: body.description || "",
    campaign_type: body.campaign_type,
    required_channel: body.required_channel,
    status: body.status || "draft",
    max_applicants: body.max_applicants || 10,
    // Legacy fields
    compensation_type: body.compensation_type || "product",
    cash_amount: body.cash_amount || 0,
    recruitment_start: body.recruitment_start || body.apply_start,
    recruitment_end: body.recruitment_end || body.apply_end,
    selection_date: body.selection_date || body.announce_date || null,
    content_deadline: body.content_deadline || body.register_end || body.apply_end,
    publish_deadline: body.publish_deadline || body.deadline_date || body.apply_end,
    // New fields
    purchase_link: body.purchase_link || null,
    purchase_price: body.purchase_price || null,
    category_name: body.category_name || null,
    region: body.region || null,
    detail_images: body.detail_images || [],
    provided_items: body.provided_items || null,
    search_keywords_text: body.search_keywords_text || null,
    mission: body.mission || null,
    required_qa: body.required_qa || null,
    apply_start: body.apply_start || body.recruitment_start,
    apply_end: body.apply_end || body.recruitment_end,
    announce_date: body.announce_date || null,
    register_start: body.register_start || null,
    register_end: body.register_end || null,
    deadline_date: body.deadline_date || null,
  };

  // Also pass through legacy fields if present
  if (body.category_id != null) campaignData.category_id = body.category_id;
  if (body.compensation_value != null) campaignData.compensation_value = body.compensation_value;
  if (body.product_name != null) campaignData.product_name = body.product_name;
  if (body.product_value != null) campaignData.product_value = body.product_value;
  if (body.store_name != null) campaignData.store_name = body.store_name;
  if (body.store_address != null) campaignData.store_address = body.store_address;
  if (body.guidelines != null) campaignData.guidelines = body.guidelines;
  if (body.required_keywords != null) campaignData.required_keywords = body.required_keywords;
  if (body.required_images_count != null) campaignData.required_images_count = body.required_images_count;
  if (body.min_text_length != null) campaignData.min_text_length = body.min_text_length;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("review_campaigns")
    .insert(campaignData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
