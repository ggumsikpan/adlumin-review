import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET - List applications
export async function GET(request: NextRequest) {
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

  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaign_id");

  if (profile?.role === "influencer") {
    // Influencer sees own applications
    const { data, error } = await admin
      .from("review_applications")
      .select(`*, campaign:review_campaigns(*, advertiser:review_advertiser_profiles(*))`)
      .eq("influencer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  if (profile?.role === "advertiser" && campaignId) {
    // Advertiser sees applications for their campaign
    const { data: campaign } = await admin
      .from("review_campaigns")
      .select("advertiser_id")
      .eq("id", campaignId)
      .single();

    if (campaign?.advertiser_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await admin
      .from("review_applications")
      .select(`*, influencer:review_influencer_profiles(*, profile:review_profiles(*), social_accounts:review_social_accounts(*))`)
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
