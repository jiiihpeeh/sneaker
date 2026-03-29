import type { SearchResponse, SearchType, EngineConfig } from "./types";

const API_BASE = "";

export async function search(
  query: string,
  engines: EngineConfig,
  type: SearchType = "all",
  page: number = 1,
  time: string = "any",
  region: string = "",
  lang: string = "",
  dateFrom: string = "",
  dateTo: string = ""
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, type, page: String(page), time, region, lang, dateFrom, dateTo });
  for (const [key, value] of Object.entries(engines)) {
    params.set(key, String(value));
  }
  
  const res = await fetch(`${API_BASE}/api/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getSuggestions(query: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/suggest?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`Suggestions failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getEngines(): Promise<{
  extensions: unknown[];
  registry: { id: string; displayName: string }[];
  defaultConfig: EngineConfig;
}> {
  const res = await fetch(`${API_BASE}/api/engines`);
  if (!res.ok) {
    throw new Error(`Engines fetch failed: ${res.statusText}`);
  }
  return res.json();
}

export async function luckySearch(
  query: string,
  engines: EngineConfig,
  type: SearchType = "all"
): Promise<string> {
  const params = new URLSearchParams({ q: query, type, page: "1", time: "any", lucky: "true", region: "us", lang: "", dateFrom: "", dateTo: "" });
  for (const [key, value] of Object.entries(engines)) {
    params.set(key, String(value));
  }
  
  const res = await fetch(`${API_BASE}/api/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Lucky search failed: ${res.statusText}`);
  }
  const data = await res.json();
  if (data.url) {
    return data.url;
  }
  throw new Error("No results found");
}
