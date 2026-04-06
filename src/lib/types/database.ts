export type UserRole = "admin" | "advertiser" | "influencer";
export type CampaignType = "visit" | "shipping" | "reporter";
export type ChannelType = "naver_blog" | "instagram" | "youtube" | "tiktok" | "youtube_shorts" | "instagram_reels";
export type CompensationType = "product" | "cash" | "product_and_cash" | "points";
export type CampaignStatus = "draft" | "pending_review" | "active" | "recruitment_closed" | "in_progress" | "completed" | "cancelled";
export type ApplicationStatus = "pending" | "selected" | "rejected" | "waitlisted" | "cancelled" | "no_show";
export type ReviewStatus = "pending" | "in_review" | "revision_requested" | "approved" | "rejected";
export type InfluencerTier = "standard" | "silver" | "gold" | "platinum" | "premier";
export type SocialPlatform = "naver_blog" | "instagram" | "youtube" | "tiktok";

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvertiserProfile {
  id: string;
  company_name: string;
  business_number: string | null;
  representative: string | null;
  business_type: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_website: string | null;
  company_logo_url: string | null;
  company_description: string | null;
  verified: boolean;
  created_at: string;
}

export interface InfluencerProfile {
  id: string;
  bio: string | null;
  gender: "male" | "female" | "other" | null;
  birth_date: string | null;
  region: string | null;
  address: string | null;
  zipcode: string | null;
  tier: InfluencerTier;
  tier_updated_at: string;
  total_campaigns_completed: number;
  total_points_earned: number;
  average_rating: number;
  warning_count: number;
  is_blacklisted: boolean;
  created_at: string;
}

export interface SocialAccount {
  id: string;
  influencer_id: string;
  platform: SocialPlatform;
  account_url: string;
  account_name: string | null;
  follower_count: number;
  average_views: number;
  average_likes: number;
  is_verified: boolean;
  connected_at: string;
  stats_updated_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Campaign {
  id: string;
  advertiser_id: string;
  title: string;
  description: string;
  campaign_type: CampaignType;
  category_id: number | null;
  required_channel: ChannelType;
  compensation_type: CompensationType;
  compensation_value: string | null;
  cash_amount: number;
  points_amount: number;
  product_name: string | null;
  product_value: number | null;
  store_name: string | null;
  store_address: string | null;
  store_lat: number | null;
  store_lng: number | null;
  shipping_required: boolean;
  required_keywords: string[] | null;
  required_images_count: number;
  min_text_length: number;
  guidelines: string | null;
  reference_urls: string[] | null;
  max_applicants: number;
  current_applicants: number;
  recruitment_start: string;
  recruitment_end: string;
  selection_date: string | null;
  content_deadline: string;
  publish_deadline: string;
  thumbnail_url: string | null;
  images: string[];
  status: CampaignStatus;
  is_featured: boolean;
  is_premium: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  advertiser?: AdvertiserProfile;
}

export interface Application {
  id: string;
  campaign_id: string;
  influencer_id: string;
  message: string | null;
  social_account_id: string | null;
  status: ApplicationStatus;
  selected_at: string | null;
  rejected_reason: string | null;
  match_score: number | null;
  product_shipped: boolean;
  product_shipped_at: string | null;
  tracking_number: string | null;
  visited_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  campaign?: Campaign;
  influencer?: InfluencerProfile & { profile?: Profile; social_accounts?: SocialAccount[] };
}

export interface Submission {
  id: string;
  application_id: string;
  campaign_id: string;
  influencer_id: string;
  draft_title: string | null;
  draft_content: string | null;
  draft_images: string[];
  draft_url: string | null;
  review_status: ReviewStatus;
  reviewer_id: string | null;
  review_comment: string | null;
  revision_count: number;
  reviewed_at: string | null;
  published_url: string | null;
  published_at: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PointsBalance {
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  type: string;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}
