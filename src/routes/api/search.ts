import { json } from "@tanstack/solid-start";
import { createFileRoute } from "@tanstack/solid-router";
import { search } from "~/server/search";
import { getEngineRegistry } from "~/server/extensions/engines/registry";
import type { EngineConfig, SearchType, TimeFilter } from "~/server/types";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url);
          const searchType = (url.searchParams.get("type") || "all") as SearchType;
          let query = url.searchParams.get("q") ?? "";
          if (typeof query !== "string") query = "";
          if (!query.trim()) {
            return json({ error: "Missing query parameter 'q'" }, { status: 400 });
          }

          const registry = getEngineRegistry();
          const engines: EngineConfig = {};
          for (const { id } of registry) {
            engines[id] = url.searchParams.get(id) !== "false";
          }

          const pageParam = url.searchParams.get("page");
          const page = Math.max(1, Math.min(10, Math.floor(Number(pageParam) || 1)));
          const timeFilter = (url.searchParams.get("time") || "any") as TimeFilter;
          const region = url.searchParams.get("region") || "";
          const lang = url.searchParams.get("lang") || "";
          const dateFrom = url.searchParams.get("dateFrom") || "";
          const dateTo = url.searchParams.get("dateTo") || "";
          const lucky = url.searchParams.get("lucky") === "true";

          const response = await search(query, engines, searchType, page, timeFilter, region, lang, dateFrom, dateTo);
          
          if (lucky && response.results.length > 0) {
            return json({ url: response.results[0].url });
          }
          
          return json(response);
        } catch (err) {
          console.error("Search error:", err);
          return json({ error: "Search failed", details: String(err) }, { status: 500 });
        }
      },
    },
  },
});
