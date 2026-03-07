import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://metricflow.app";

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/sign-in`, lastModified: new Date() },
    { url: `${base}/dashboard`, lastModified: new Date() },
    { url: `${base}/dashboard/team`, lastModified: new Date() },
    { url: `${base}/dashboard/reports`, lastModified: new Date() },
    { url: `${base}/privacidad`, lastModified: new Date() },
  ];
}
