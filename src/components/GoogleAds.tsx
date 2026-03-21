import Script from "next/script";

// Replace with your actual Google Ads ID (format: AW-XXXXXXXXXX)
const GA_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";

export default function GoogleAds() {
  if (!GA_ADS_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ADS_ID)}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ADS_ID}');
        `}
      </Script>
    </>
  );
}
