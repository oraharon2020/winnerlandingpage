// Central plan definitions — used by Pricing, checkout, admin, and dashboard gating

export interface Plan {
  id: string;
  name: string;
  nameHe: string;
  price: number; // ILS
  originalPrice?: number; // For showing discount
  period: "week" | "month" | "forever";
  periodHe: string;
  durationDays: number;
  features: string[];
  maxTipsPerDay: number; // 1 for free, Infinity for paid
  badge?: string;
  popular?: boolean;
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    nameHe: "חינם",
    price: 0,
    period: "forever",
    periodHe: "לצמיתות",
    durationDays: 0,
    features: [
      "טיפ 1 ביום — הטוב ביותר",
      "צפייה במשחקי היום",
      "30+ ליגות",
    ],
    maxTipsPerDay: 1,
  },
  weekly: {
    id: "weekly",
    name: "Weekly",
    nameHe: "חבילת היכרות",
    price: 49,
    period: "week",
    periodHe: "/ שבוע",
    durationDays: 7,
    features: [
      "כל הטיפים — ללא הגבלה",
      "דשבורד תוצאות מלא",
      "ניתוח מפורט לכל משחק",
      "30+ ליגות",
      "ביטול בכל רגע",
    ],
    maxTipsPerDay: Infinity,
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    nameHe: "חבילה חודשית",
    price: 199,
    originalPrice: 399,
    period: "month",
    periodHe: "/ חודש",
    durationDays: 30,
    features: [
      "כל הטיפים — ללא הגבלה",
      "דשבורד תוצאות מלא",
      "ניתוח מפורט לכל משחק",
      "30+ ליגות",
      "התראות ישירות כל בוקר",
      "ביטול בכל רגע",
    ],
    maxTipsPerDay: Infinity,
    badge: "50% הנחה — מבצע השקה",
    popular: true,
  },
};

export function getPlanById(id: string): Plan | undefined {
  return PLANS[id];
}
