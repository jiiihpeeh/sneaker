import type {
  SearchEngine,
  SearchResult,
  TimeFilter,
  EngineContext,
  SettingField,
} from "../../types";
import { getPage } from "../../utils/puppeteer";
import {
  resolveGoogleTbs,
  resolveGoogleCustomDateTbs,
  resolveGoogleHref,
} from "../../utils/google-utils";

const REGION_TO_LANG: Record<string, string> = {
  US: "en",
  GB: "en",
  DE: "de",
  FR: "fr",
  ES: "es",
  IT: "it",
  NL: "nl",
  PL: "pl",
  BR: "pt",
  JP: "ja",
  IN: "hi",
  AU: "en",
  CA: "en",
};

export class GoogleEngine implements SearchEngine {
  name = "Google";
  bangShortcut = "g";
  safeSearch: string = "off";
  settingsSchema: SettingField[] = [
    {
      key: "safeSearch",
      label: "Safe Search",
      type: "select",
      options: ["off", "on"],
      description: "Filter explicit content from search results.",
    },
  ];

  configure(settings: Record<string, string | string[]>): void {
    if (typeof settings.safeSearch === "string") {
      this.safeSearch = settings.safeSearch;
    }
  }

  async executeSearch(
    query: string,
    page: number = 1,
    timeFilter?: TimeFilter,
    context?: EngineContext,
  ): Promise<SearchResult[]> {
    const start = (page - 1) * 10;
    const region = context?.region;
    const lang = context?.lang || (region ? REGION_TO_LANG[region.toUpperCase()] || "en" : "en");

    const params = new URLSearchParams({
      q: query,
      hl: lang,
      lr: `lang_${lang}`,
      ie: "utf8",
      oe: "utf8",
      start: String(start),
      filter: "0",
    });

    // Note: Google's cr parameter is often ignored; hl and lr are more reliable for language/region
    // Keeping this commented out as it may not work as expected
    // if (region && region !== "worldwide") {
    //   params.set("cr", `country${region.toUpperCase()}`);
    // }

    const tbs =
      timeFilter === "custom"
        ? resolveGoogleCustomDateTbs(context?.dateFrom, context?.dateTo)
        : resolveGoogleTbs(timeFilter);
    if (tbs) params.set("tbs", tbs);
    if (this.safeSearch === "on") params.set("safe", "active");

    const url = `https://www.google.com/search?${params.toString()}`;

    const page2 = await getPage();
    try {
      await page2.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      const results: SearchResult[] = [];

      const resultElements = await page2.evaluate(() => {
        const items: { title: string; url: string; snippet: string }[] = [];
        
        document.querySelectorAll('a[href^="/url?q="]').forEach((el) => {
          const linkEl = el as HTMLAnchorElement;
          const href = linkEl.getAttribute("href") || "";
          const titleEl = linkEl.querySelector("span");
          const title = titleEl?.textContent?.trim() || "";
          
          let snippet = "";
          const parent = linkEl.parentElement;
          if (parent) {
            const nextDiv = parent.nextElementSibling as HTMLElement;
            if (nextDiv && nextDiv.tagName === "DIV") {
              snippet = nextDiv.textContent?.trim() || "";
            }
          }

          if (title && href) {
            items.push({ title, url: href, snippet });
          }
        });

        if (items.length === 0) {
          document.querySelectorAll("[data-hveid] a[href]").forEach((el) => {
            const linkEl = el as HTMLAnchorElement;
            const href = linkEl.getAttribute("href") || "";
            const h3 = linkEl.querySelector("h3");
            const title = h3?.textContent?.trim() || "";
            
            const container = linkEl.closest("[data-hveid]");
            const snippetEl = container?.querySelector("[data-sncf]");
            const snippet = snippetEl?.textContent?.trim() || "";

            if (title && href) {
              items.push({ title, url: href, snippet });
            }
          });
        }

        return items;
      });

      for (const item of resultElements) {
        const resolvedHref = resolveGoogleHref(item.url);
        if (
          item.title &&
          resolvedHref &&
          resolvedHref.startsWith("http") &&
          !resolvedHref.includes("google.com/search")
        ) {
          results.push({ title: item.title, url: resolvedHref, snippet: item.snippet, source: this.name });
        }
      }

      return results;
    } catch (e) {
      console.error("Google Puppeteer error:", e);
      return [];
    } finally {
      await page2.close();
    }
  }
}
