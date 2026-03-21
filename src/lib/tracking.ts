"use client";

// Call this function when a user clicks the Telegram CTA button
// to track conversions in Google Ads.
//
// Usage: add onClick={trackConversion} to CTA links
//
// Make sure NEXT_PUBLIC_GOOGLE_ADS_ID and NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL
// are set in your environment variables.

export function trackConversion() {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL;

  if (typeof window !== "undefined" && adsId && conversionLabel) {
    const w = window as typeof window & {
      gtag?: (...args: unknown[]) => void;
    };
    w.gtag?.("event", "conversion", {
      send_to: `${adsId}/${conversionLabel}`,
    });
  }
}
