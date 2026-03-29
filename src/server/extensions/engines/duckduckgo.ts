import type {
  SearchEngine,
  SearchResult,
  TimeFilter,
  EngineContext,
  SettingField,
} from "../../types";
import { getPage } from "../../utils/puppeteer";

const DDG_SAFE_SEARCH_MAP: Record<string, string> = {
  moderate: "-2",
  strict: "1",
};

export class DuckDuckGoEngine implements SearchEngine {
  name = "DuckDuckGo";
  bangShortcut = "ddg";
  safeSearch: string = "off";
  settingsSchema: SettingField[] = [
    {
      key: "safeSearch",
      label: "Safe Search",
      type: "select",
      options: ["off", "moderate", "strict"],
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
    page?: number,
    timeFilter?: TimeFilter,
    context?: EngineContext,
  ): Promise<SearchResult[]> {
    const offset = ((page || 1) - 1) * 30;
    const lang = context?.lang;
    const region = context?.region;
    const params = new URLSearchParams({ q: query });
    if (offset > 0) {
      params.set("s", String(offset));
      params.set("dc", String(offset + 1));
    }
    const regionCode = region || "us";
    if (lang && lang !== "en") {
      params.set("kl", `${lang}-${lang}`);
    } else {
      params.set("kl", `${regionCode.toLowerCase()}-${regionCode.toLowerCase()}`);
    }
    if (DDG_SAFE_SEARCH_MAP[this.safeSearch]) params.set("kp", DDG_SAFE_SEARCH_MAP[this.safeSearch]);
    if (timeFilter && timeFilter !== "any" && timeFilter !== "custom") {
      const dfMap: Record<string, string> = {
        hour: "h",
        day: "d",
        week: "w",
        month: "m",
        year: "y",
      };
      if (dfMap[timeFilter]) params.set("df", dfMap[timeFilter]);
    }
    const url = `https://html.duckduckgo.com/html/?${params.toString()}`;

    const page2 = await getPage();
    try {
      await page2.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      const results: SearchResult[] = [];

      const resultElements = await page2.evaluate(() => {
        const items: { title: string; url: string; snippet: string }[] = [];
        
        document.querySelectorAll(".result").forEach((el) => {
          const titleEl = el.querySelector(".result__title a") as HTMLAnchorElement;
          const snippetEl = el.querySelector(".result__snippet");
          
          const title = titleEl?.textContent?.trim() || "";
          let href = titleEl?.getAttribute("href") || "";
          const snippet = snippetEl?.textContent?.trim() || "";

          if (href.includes("uddg=")) {
            try {
              const url = new URL(href, "https://duckduckgo.com");
              href = decodeURIComponent(url.searchParams.get("uddg") || href);
            } catch {
              // keep original
            }
          }

          if (title && href && href.startsWith("http")) {
            items.push({ title, url: href, snippet });
          }
        });

        return items;
      });

      for (const item of resultElements) {
        results.push({ title: item.title, url: item.url, snippet: item.snippet, source: this.name });
      }

      return results;
    } catch (e) {
      console.error("DuckDuckGo Puppeteer error:", e);
      return [];
    } finally {
      await page2.close();
    }
  }
}
