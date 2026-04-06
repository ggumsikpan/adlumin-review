import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  return format(new Date(date), "yyyy.MM.dd", { locale: ko });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "yyyy.MM.dd HH:mm", { locale: ko });
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "만";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "천";
  }
  return num.toLocaleString("ko-KR");
}
