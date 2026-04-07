// 캠페인 유형 (제품형/방문형)
export const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  seller: "제품형(셀러)",
  place: "방문형(플레이스)",
};

// 광고채널 - 제품형(셀러)
export const SELLER_CHANNEL_OPTIONS: { value: string; label: string }[] = [
  { value: "purchase_review", label: "구매평체험단" },
  { value: "purchase_blog", label: "구매평+블로그" },
  { value: "purchase_insta", label: "구매평+인스타" },
  { value: "purchase_reels", label: "구매평+릴스" },
  { value: "purchase_clip", label: "구매평+클립" },
  { value: "purchase_tiktok", label: "구매평+틱톡" },
  { value: "purchase_shorts", label: "구매평+쇼츠" },
  { value: "search_purchase", label: "검색유입구매평체험단" },
  { value: "blog", label: "블로그체험단" },
  { value: "blog_reporter", label: "블로그기자단" },
  { value: "naver_influencer", label: "네이버인플루언서" },
  { value: "instagram", label: "인스타체험단" },
  { value: "reels", label: "릴스체험단" },
  { value: "clip", label: "클립체험단" },
  { value: "tiktok", label: "틱톡체험단" },
  { value: "shorts", label: "쇼츠체험단" },
];

// 광고채널 - 방문형(플레이스)
export const PLACE_CHANNEL_OPTIONS: { value: string; label: string }[] = [
  { value: "blog", label: "블로그체험단" },
  { value: "blog_reporter", label: "블로그기자단" },
  { value: "instagram", label: "인스타체험단" },
  { value: "reels", label: "릴스체험단" },
  { value: "clip", label: "클립체험단" },
  { value: "tiktok", label: "틱톡체험단" },
  { value: "shorts", label: "쇼츠체험단" },
];

// 모든 채널 라벨 (표시용)
export const CHANNEL_LABELS: Record<string, string> = {
  purchase_review: "구매평체험단",
  purchase_blog: "구매평+블로그",
  purchase_insta: "구매평+인스타",
  purchase_reels: "구매평+릴스",
  purchase_clip: "구매평+클립",
  purchase_tiktok: "구매평+틱톡",
  purchase_shorts: "구매평+쇼츠",
  search_purchase: "검색유입구매평체험단",
  blog: "블로그체험단",
  blog_reporter: "블로그기자단",
  naver_influencer: "네이버인플루언서",
  instagram: "인스타체험단",
  reels: "릴스체험단",
  clip: "클립체험단",
  tiktok: "틱톡체험단",
  shorts: "쇼츠체험단",
};

// 카테고리 - 제품형(셀러)
export const SELLER_CATEGORIES: string[] = [
  "식품", "뷰티", "생활", "유아", "IT", "도서", "패션", "반려동물", "서비스", "기타",
];

// 카테고리 - 방문형(플레이스)
export const PLACE_CATEGORIES: string[] = [
  "맛집", "뷰티", "숙박", "문화", "운동", "서비스", "기타",
];

// 지역 (방문형)
export const REGIONS: string[] = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "초안",
  active: "모집중",
  closed: "모집마감",
  in_progress: "진행중",
  completed: "완료",
  cancelled: "취소",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: "대기중",
  selected: "선정",
  rejected: "미선정",
  cancelled: "취소",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "제출 대기",
  in_review: "검토중",
  revision_requested: "수정 요청",
  approved: "승인",
  rejected: "거절",
};

export const TIER_LABELS: Record<string, string> = {
  standard: "스탠다드",
  silver: "실버",
  gold: "골드",
  platinum: "플래티넘",
  premier: "프리미어",
};
