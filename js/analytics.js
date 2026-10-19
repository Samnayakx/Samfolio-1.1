// Shared by every page that is not the 404: Vercel Web Analytics and Google Analytics 4.
// Vercel Web Analytics. The script is served by Vercel once Analytics is enabled on the project.
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
if (!document.querySelector('script[src="/_vercel/insights/script.js"]')) {
  const insights = document.createElement("script");
  insights.defer = true;
  insights.src = "/_vercel/insights/script.js";
  document.head.appendChild(insights);
}

// Google Analytics 4 (production host only, so previews and local testing stay out of the data).
if (location.hostname === "www.sambitnayak.com" && !window.gtag) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", "G-8HY1JC5JWE");
  const ga = document.createElement("script");
  ga.async = true;
  ga.src = "https://www.googletagmanager.com/gtag/js?id=G-8HY1JC5JWE";
  document.head.appendChild(ga);
}
