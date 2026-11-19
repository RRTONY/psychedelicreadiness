import Script from "next/script";
import { ANALYTICS_ON, GA_MEASUREMENT_ID } from "@/lib/analytics";

// Same pattern as tonygreenberg.com's tag (plain next/script, no extra package). Only the live
// domain is counted: Netlify previews and localhost never reach the reports. The page address is
// sent without its query string, so a `?m=<medicine>` link isn't recorded; quiz answers never
// go in the address at all (they stay in the browser, see the Privacy page).
export function GoogleAnalytics() {
  if (!ANALYTICS_ON) return null;
  return (
    <Script id="google-analytics" strategy="afterInteractive">
      {`(function () {
  var h = window.location.hostname;
  if (h !== "psychedelicreadiness.com" && h !== "www.psychedelicreadiness.com") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", "${GA_MEASUREMENT_ID}", {
    page_location: window.location.origin + window.location.pathname,
    cookie_flags: "SameSite=None;Secure"
  });
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}";
  document.head.appendChild(s);
})();`}
    </Script>
  );
}
