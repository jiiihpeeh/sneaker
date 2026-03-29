import server from "../../dist/server/server.js";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const port = parseInt(process.env.PORT || "4444", 10);
const clientDist = resolve("./dist/client");

function serveStatic(url) {
  let filePath = join(clientDist, url.pathname);
  
  if (!existsSync(filePath) || !filePath.startsWith(clientDist)) {
    return null;
  }

  const file = readFileSync(filePath);
  const contentType = getContentType(url.pathname);
  return new Response(file, {
    headers: { "Content-Type": contentType },
  });
}

function getContentType(path) {
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname.startsWith("/assets/") || 
        url.pathname === "/favicon.ico" ||
        url.pathname === "/logo.svg" ||
        url.pathname === "/robots.txt" ||
        url.pathname === "/manifest.json") {
      const staticResponse = serveStatic(url);
      if (staticResponse) return staticResponse;
    }

    try {
      return await server.fetch(req);
    } catch (error) {
      console.error("Fetch error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`Server running on port ${port}`);
