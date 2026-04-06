import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PATCH - Update application status (advertiser selects/rejects)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get application with campaign
  const { data: application } = await admin
    .from("review_applications")
    .select("*, campaign:review_campaigns(advertiser_id, title)")
    .eq("id", id)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify advertiser owns the campaign
  if (application.campaign?.advertiser_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status: newStatus, rejected_reason } = body;

  const updateData: Record<string, unknown> = { status: newStatus };
  if (newStatus === "selected") {
    updateData.selected_at = new Date().toISOString();
  }
  if (newStatus === "rejected" && rejected_reason) {
    updateData.rejected_reason = rejected_reason;
  }

  const { data, error } = await admin
    .from("review_applications")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify influencer
  const notificationType =
    newStatus === "selected"
      ? "application_selected"
      : newStatus === "rejected"
        ? "application_rejected"
        : null;

  if (notificationType) {
    await admin.from("review_notifications").insert({
      user_id: application.influencer_id,
      type: notificationType,
      title:
        newStatus === "selected"
          ? "캠페인 선정 완료"
          : "캠페인 미선정 안내",
      message: `"${application.campaign?.title}" 캠페인에 ${newStatus === "selected" ? "선정" : "미선정"}되었습니다.`,
      reference_type: "application",
      reference_id: id,
    });
  }

  return NextResponse.json(data);
}

// DELETE - Cancel application (influencer only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: application } = await admin
    .from("review_applications")
    .select("influencer_id, status")
    .eq("id", id)
    .single();

  if (application?.influencer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (application.status !== "pending") {
    return NextResponse.json(
      { error: "Can only cancel pending applications" },
      { status: 400 }
    );
  }

  const { error } = await admin
    .from("review_applications")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
