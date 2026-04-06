import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, role, displayName, phone, ...extra } = body;

  const admin = createAdminClient();

  // 1. Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName, role },
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || "회원가입에 실패했습니다." },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // 2. Create base profile
  const { error: profileError } = await admin
    .from("review_profiles")
    .insert({
      id: userId,
      role,
      display_name: displayName,
      email,
      phone: phone || null,
    });

  if (profileError) {
    // Rollback: delete auth user
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: "프로필 생성에 실패했습니다: " + profileError.message },
      { status: 500 }
    );
  }

  // 3. Create role-specific profile
  if (role === "advertiser") {
    const { error } = await admin
      .from("review_advertiser_profiles")
      .insert({
        id: userId,
        company_name: extra.companyName,
        business_number: extra.businessNumber || null,
        representative: extra.representative || null,
        company_phone: extra.companyPhone || null,
        company_description: extra.companyDescription || null,
      });

    if (error) {
      await admin.from("review_profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "광고주 프로필 생성에 실패했습니다: " + error.message },
        { status: 500 }
      );
    }
  } else if (role === "influencer") {
    const { error } = await admin
      .from("review_influencer_profiles")
      .insert({
        id: userId,
        bio: extra.bio || null,
        gender: extra.gender || null,
        region: extra.region || null,
      });

    if (error) {
      await admin.from("review_profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "인플루언서 프로필 생성에 실패했습니다: " + error.message },
        { status: 500 }
      );
    }

    // Create points balance
    await admin
      .from("review_points_balance")
      .insert({ user_id: userId });
  }

  return NextResponse.json({ userId, role }, { status: 201 });
}
