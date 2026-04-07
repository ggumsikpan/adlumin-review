"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Campaign } from "@/lib/types/database";
import {
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
} from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const isRecruiting = campaign.status === "active";
  const endDate = campaign.apply_end || campaign.recruitment_end;
  const daysLeft = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  const typeIcon =
    campaign.campaign_type === "seller"
      ? "📦"
      : campaign.campaign_type === "place"
        ? "📍"
        : campaign.campaign_type === "visit"
          ? "📍"
          : campaign.campaign_type === "shipping"
            ? "📦"
            : "📰";

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-video bg-muted relative">
          {campaign.thumbnail_url ? (
            <img
              src={campaign.thumbnail_url}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
              {typeIcon}
            </div>
          )}
          {isRecruiting && daysLeft > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
              D-{daysLeft}
            </Badge>
          )}
          {campaign.is_featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
              추천
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {CAMPAIGN_TYPE_LABELS[campaign.campaign_type] || campaign.campaign_type}
            </Badge>
            <Badge variant="secondary">
              {CHANNEL_LABELS[campaign.required_channel] || campaign.required_channel}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug">
            {campaign.title}
          </h3>
          {campaign.advertiser && (
            <p className="text-xs text-muted-foreground">
              {campaign.advertiser.company_name}
            </p>
          )}
          {campaign.category_name && (
            <p className="text-xs text-muted-foreground">
              {campaign.category_name}
              {campaign.region ? ` | ${campaign.region}` : ""}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              모집 {campaign.current_applicants}/{campaign.max_applicants}명
            </span>
            <span>~{formatDate(endDate)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
