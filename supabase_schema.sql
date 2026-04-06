-- ============================================================
-- ADLUMIN REVIEW - DATABASE SCHEMA
-- Run in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. USER PROFILES
-- ============================================================

CREATE TABLE review_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'advertiser', 'influencer')),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON review_profiles(role);

CREATE TABLE review_advertiser_profiles (
  id UUID PRIMARY KEY REFERENCES review_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_number TEXT,
  representative TEXT,
  business_type TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_website TEXT,
  company_logo_url TEXT,
  company_description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_influencer_profiles (
  id UUID PRIMARY KEY REFERENCES review_profiles(id) ON DELETE CASCADE,
  bio TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  region TEXT,
  address TEXT,
  zipcode TEXT,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'silver', 'gold', 'platinum', 'premier')),
  tier_updated_at TIMESTAMPTZ DEFAULT NOW(),
  total_campaigns_completed INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES review_influencer_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('naver_blog', 'instagram', 'youtube', 'tiktok')),
  account_url TEXT NOT NULL,
  account_name TEXT,
  follower_count INTEGER DEFAULT 0,
  average_views INTEGER DEFAULT 0,
  average_likes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  stats_updated_at TIMESTAMPTZ,
  UNIQUE(influencer_id, platform)
);

CREATE INDEX idx_social_platform ON review_social_accounts(platform);

-- ============================================================
-- 2. CATEGORIES & TAGS
-- ============================================================

CREATE TABLE review_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE review_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- ============================================================
-- 3. CAMPAIGNS
-- ============================================================

CREATE TABLE review_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID NOT NULL REFERENCES review_advertiser_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('visit', 'shipping', 'reporter')),
  category_id INTEGER REFERENCES review_categories(id),
  required_channel TEXT NOT NULL CHECK (required_channel IN ('naver_blog', 'instagram', 'youtube', 'tiktok', 'youtube_shorts', 'instagram_reels')),
  compensation_type TEXT NOT NULL CHECK (compensation_type IN ('product', 'cash', 'product_and_cash', 'points')),
  compensation_value TEXT,
  cash_amount INTEGER DEFAULT 0,
  points_amount INTEGER DEFAULT 0,
  product_name TEXT,
  product_value INTEGER,
  store_name TEXT,
  store_address TEXT,
  store_lat NUMERIC(10,7),
  store_lng NUMERIC(10,7),
  shipping_required BOOLEAN DEFAULT FALSE,
  required_keywords TEXT[],
  required_images_count INTEGER DEFAULT 1,
  min_text_length INTEGER DEFAULT 500,
  guidelines TEXT,
  reference_urls TEXT[],
  max_applicants INTEGER NOT NULL DEFAULT 10,
  current_applicants INTEGER DEFAULT 0,
  recruitment_start TIMESTAMPTZ NOT NULL,
  recruitment_end TIMESTAMPTZ NOT NULL,
  selection_date TIMESTAMPTZ,
  content_deadline TIMESTAMPTZ NOT NULL,
  publish_deadline TIMESTAMPTZ NOT NULL,
  thumbnail_url TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'active', 'recruitment_closed',
    'in_progress', 'completed', 'cancelled'
  )),
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON review_campaigns(status);
CREATE INDEX idx_campaigns_type ON review_campaigns(campaign_type);
CREATE INDEX idx_campaigns_channel ON review_campaigns(required_channel);
CREATE INDEX idx_campaigns_advertiser ON review_campaigns(advertiser_id);
CREATE INDEX idx_campaigns_category ON review_campaigns(category_id);
CREATE INDEX idx_campaigns_recruitment ON review_campaigns(recruitment_start, recruitment_end);
CREATE INDEX idx_campaigns_featured ON review_campaigns(is_featured) WHERE is_featured = TRUE;

CREATE TABLE review_campaign_tags (
  campaign_id UUID REFERENCES review_campaigns(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES review_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, tag_id)
);

-- ============================================================
-- 4. APPLICATIONS
-- ============================================================

CREATE TABLE review_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES review_campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES review_influencer_profiles(id) ON DELETE CASCADE,
  message TEXT,
  social_account_id UUID REFERENCES review_social_accounts(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'selected', 'rejected', 'waitlisted', 'cancelled', 'no_show'
  )),
  selected_at TIMESTAMPTZ,
  rejected_reason TEXT,
  match_score INTEGER,
  product_shipped BOOLEAN DEFAULT FALSE,
  product_shipped_at TIMESTAMPTZ,
  tracking_number TEXT,
  visited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

CREATE INDEX idx_applications_campaign ON review_applications(campaign_id);
CREATE INDEX idx_applications_influencer ON review_applications(influencer_id);
CREATE INDEX idx_applications_status ON review_applications(status);

-- ============================================================
-- 5. CONTENT SUBMISSIONS & REVIEW
-- ============================================================

CREATE TABLE review_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES review_applications(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES review_campaigns(id),
  influencer_id UUID NOT NULL REFERENCES review_influencer_profiles(id),
  draft_title TEXT,
  draft_content TEXT,
  draft_images TEXT[] DEFAULT '{}',
  draft_url TEXT,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN (
    'pending', 'in_review', 'revision_requested', 'approved', 'rejected'
  )),
  reviewer_id UUID REFERENCES review_profiles(id),
  review_comment TEXT,
  revision_count INTEGER DEFAULT 0,
  reviewed_at TIMESTAMPTZ,
  published_url TEXT,
  published_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_application ON review_submissions(application_id);
CREATE INDEX idx_submissions_campaign ON review_submissions(campaign_id);
CREATE INDEX idx_submissions_status ON review_submissions(review_status);

CREATE TABLE review_submission_revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES review_submissions(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  content TEXT,
  images TEXT[] DEFAULT '{}',
  reviewer_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. CONTENT ANALYTICS
-- ============================================================

CREATE TABLE review_content_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES review_submissions(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  keyword_rankings JSONB DEFAULT '{}',
  search_exposure_count INTEGER DEFAULT 0,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_submission ON review_content_metrics(submission_id);

-- ============================================================
-- 7. POINTS & TRANSACTIONS
-- ============================================================

CREATE TABLE review_points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'campaign_reward', 'bonus', 'referral', 'withdrawal',
    'purchase', 'penalty', 'adjustment'
  )),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_user ON review_points_transactions(user_id);
CREATE INDEX idx_points_created ON review_points_transactions(created_at);

CREATE TABLE review_points_balance (
  user_id UUID PRIMARY KEY REFERENCES review_profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. WARNINGS & PENALTIES
-- ============================================================

CREATE TABLE review_warnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES review_influencer_profiles(id) ON DELETE CASCADE,
  issued_by UUID REFERENCES review_profiles(id),
  reason TEXT NOT NULL CHECK (reason IN (
    'no_show', 'late_submission', 'low_quality', 'guideline_violation',
    'fake_content', 'unauthorized_edit', 'other'
  )),
  description TEXT,
  campaign_id UUID REFERENCES review_campaigns(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '6 months'),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warnings_influencer ON review_warnings(influencer_id);

-- ============================================================
-- 9. REVIEWS & RATINGS
-- ============================================================

CREATE TABLE review_influencer_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES review_campaigns(id),
  influencer_id UUID NOT NULL REFERENCES review_influencer_profiles(id),
  advertiser_id UUID NOT NULL REFERENCES review_advertiser_profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

CREATE TABLE review_campaign_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES review_campaigns(id),
  influencer_id UUID NOT NULL REFERENCES review_influencer_profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

-- ============================================================
-- 10. NOTIFICATIONS
-- ============================================================

CREATE TABLE review_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES review_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'application_received', 'application_selected', 'application_rejected',
    'submission_approved', 'submission_revision', 'submission_rejected',
    'campaign_reminder', 'points_earned', 'warning_issued',
    'new_campaign_match', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON review_notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON review_notifications(created_at);

-- ============================================================
-- 11. FAVORITES
-- ============================================================

CREATE TABLE review_favorites (
  user_id UUID REFERENCES review_profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES review_campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, campaign_id)
);

-- ============================================================
-- 12. MESSAGES
-- ============================================================

CREATE TABLE review_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES review_campaigns(id),
  advertiser_id UUID NOT NULL REFERENCES review_advertiser_profiles(id),
  influencer_id UUID NOT NULL REFERENCES review_influencer_profiles(id),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, advertiser_id, influencer_id)
);

CREATE TABLE review_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES review_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES review_profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON review_messages(conversation_id, created_at);

-- ============================================================
-- 13. TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON review_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON review_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON review_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_submissions_updated BEFORE UPDATE ON review_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_applicant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE review_campaigns
  SET current_applicants = current_applicants + 1
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_application_count AFTER INSERT ON review_applications
  FOR EACH ROW EXECUTE FUNCTION increment_applicant_count();

CREATE OR REPLACE FUNCTION check_blacklist()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM review_warnings
  WHERE influencer_id = NEW.influencer_id AND is_active = TRUE;

  IF active_count >= 5 THEN
    UPDATE review_influencer_profiles
    SET is_blacklisted = TRUE
    WHERE id = NEW.influencer_id;
  END IF;

  UPDATE review_influencer_profiles
  SET warning_count = active_count
  WHERE id = NEW.influencer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_blacklist AFTER INSERT ON review_warnings
  FOR EACH ROW EXECUTE FUNCTION check_blacklist();

-- ============================================================
-- 14. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE review_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON review_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON review_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Active campaigns are public"
  ON review_campaigns FOR SELECT USING (status IN ('active','recruitment_closed','in_progress','completed'));
CREATE POLICY "Advertisers manage own campaigns"
  ON review_campaigns FOR ALL USING (auth.uid() = advertiser_id);

CREATE POLICY "Influencers see own applications"
  ON review_applications FOR SELECT USING (auth.uid() = influencer_id);
CREATE POLICY "Advertisers see campaign applications"
  ON review_applications FOR SELECT USING (
    campaign_id IN (SELECT id FROM review_campaigns WHERE advertiser_id = auth.uid())
  );

CREATE POLICY "Users see own notifications"
  ON review_notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Participants see messages"
  ON review_messages FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM review_conversations
      WHERE advertiser_id = auth.uid() OR influencer_id = auth.uid()
    )
  );

-- ============================================================
-- 15. SEED DATA - CATEGORIES
-- ============================================================

INSERT INTO review_categories (name, slug, icon, sort_order) VALUES
  ('맛집', 'food', '🍽️', 1),
  ('뷰티', 'beauty', '💄', 2),
  ('패션', 'fashion', '👗', 3),
  ('여행', 'travel', '✈️', 4),
  ('육아', 'parenting', '👶', 5),
  ('IT/테크', 'tech', '💻', 6),
  ('건강/피트니스', 'health', '💪', 7),
  ('반려동물', 'pets', '🐾', 8),
  ('인테리어', 'interior', '🏠', 9),
  ('도서/교육', 'education', '📚', 10),
  ('생활용품', 'lifestyle', '🛒', 11),
  ('자동차', 'automotive', '🚗', 12);
