import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://metricflow.app";

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/login`, lastModified: new Date() },
    { url: `${base}/privacidad`, lastModified: new Date() },
  ];
}
