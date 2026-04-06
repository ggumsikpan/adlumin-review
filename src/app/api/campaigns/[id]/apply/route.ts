import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST - Apply to campaign (influencer only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
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

  if (profile?.role !== "influencer") {
    return NextResponse.json(
      { error: "Only influencers can apply" },
      { status: 403 }
    );
  }

  // Check blacklist
  const admin = createAdminClient();
  const { data: infProfile } = await admin
    .from("review_influencer_profiles")
    .select("is_blacklisted")
    .eq("id", user.id)
    .single();

  if (infProfile?.is_blacklisted) {
    return NextResponse.json(
      { error: "Blacklisted users cannot apply" },
      { status: 403 }
    );
  }

  // Check campaign is active
  const { data: campaign } = await admin
    .from("review_campaigns")
    .select("status, max_applicants, current_applicants, recruitment_end")
    .eq("id", campaignId)
    .single();

  if (!campaign || campaign.status !== "active") {
    return NextResponse.json(
      { error: "Campaign is not accepting applications" },
      { status: 400 }
    );
  }

  if (new Date(campaign.recruitment_end) < new Date()) {
    return NextResponse.json(
      { error: "Recruitment period has ended" },
      { status: 400 }
    );
  }

  const body = await request.json();

  const { data, error } = await admin
    .from("review_applications")
    .insert({
      campaign_id: campaignId,
      influencer_id: user.id,
      message: body.message || null,
      social_account_id: body.social_account_id || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Already applied to this campaign" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create notification for advertiser
  const { data: campaignFull } = await admin
    .from("review_campaigns")
    .select("advertiser_id, title")
    .eq("id", campaignId)
    .single();

  if (campaignFull) {
    await admin.from("review_notifications").insert({
      user_id: campaignFull.advertiser_id,
      type: "application_received",
      title: "새로운 신청",
      message: `"${campaignFull.title}" 캠페인에 새로운 신청이 접수되었습니다.`,
      reference_type: "application",
      reference_id: data.id,
    });
  }

  return NextResponse.json(data, { status: 201 });
}
