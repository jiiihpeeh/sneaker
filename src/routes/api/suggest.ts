import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/api/suggest")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q");

        if (!q || q.length < 2) {
          return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const res = await fetch(
            `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&format=json`
          );
          const data = await res.json();
          const suggestions = data.map((item: { phrase: string }) => item.phrase) || [];
          return new Response(JSON.stringify(suggestions), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
