import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

const PAGES = ["", "/lobby", "/arcade", "/docs", "/draw"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({ url: `${BRAND.url}${p}` }));
}
