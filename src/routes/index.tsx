import { createSignal, onMount, Show } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import { SearchBar } from "~/components/SearchBar";
import { ResultsList } from "~/components/ResultsList";
import { Sidebar } from "~/components/Sidebar";
import { Logo } from "~/components/Logo";
import { ResultsHeader } from "~/components/ResultsHeader";
import { LoadingSkeleton } from "~/components/LoadingSkeleton";
import { Maps } from "~/components/Maps";
import { search, luckySearch } from "~/lib/api";
import type { SearchType, EngineConfig, SearchResponse } from "~/lib/types";
import "./index.css";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const [currentQuery, setCurrentQuery] = createSignal("");
  const [currentRegion, setCurrentRegion] = createSignal("worldwide");
  const [currentLang, setCurrentLang] = createSignal("");
  const [currentTime, setCurrentTime] = createSignal("any");
  const [currentType, setCurrentType] = createSignal<SearchType>("all");
  const [results, setResults] = createSignal<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);

  const getEnginesForType = (searchType: SearchType): EngineConfig => {
    const baseEngines = { duckduckgo: true, google: true, brave: true };
    if (searchType === "images") {
      return { "google-images": true, "bing-images": true };
    }
    if (searchType === "videos") {
      return { "google-videos": true, "bing-videos": true };
    }
    if (searchType === "news") {
      return { "brave-news": true, "bing-news": true };
    }
    if (searchType === "maps") {
      return {};
    }
    return baseEngines;
  };

  const doSearch = async (q: string, type: SearchType, region: string, lang: string, time: string) => {
    setIsLoading(true);
    try {
      const data = await search(q, getEnginesForType(type), type, 1, time, region, lang, "", "");
      setResults(data);
    } catch (e) {
      console.error(e);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const type = (params.get("type") || "all") as SearchType;
    const region = params.get("region") || "worldwide";
    const lang = params.get("lang") || "";
    const time = params.get("time") || "any";
    setCurrentQuery(q);
    setCurrentType(type);
    setCurrentRegion(region);
    setCurrentLang(lang);
    setCurrentTime(time);
    if (q) doSearch(q, type, region, lang, time);
  });

  function handleSearch(q: string) {
    setCurrentQuery(q);
    const type = currentType();
    setCurrentType(type);
    doSearch(q, type, currentRegion(), currentLang(), currentTime());
    window.history.pushState({}, "", `/?q=${encodeURIComponent(q)}&type=${type}&region=${currentRegion()}&lang=${currentLang()}&time=${currentTime()}`);
  }

  function handleTabChange(t: string) {
    setCurrentType(t as SearchType);
    doSearch(currentQuery(), t as SearchType, currentRegion(), currentLang(), currentTime());
    window.history.pushState({}, "", `/?q=${encodeURIComponent(currentQuery())}&type=${t}&region=${currentRegion()}&lang=${currentLang()}&time=${currentTime()}`);
  }

  function handleRegionChange(r: string) {
    setCurrentRegion(r);
    if (currentQuery()) {
      doSearch(currentQuery(), currentType(), r, currentLang(), currentTime());
      window.history.pushState({}, "", `/?q=${encodeURIComponent(currentQuery())}&type=${currentType()}&region=${r}&lang=${currentLang()}&time=${currentTime()}`);
    }
  }

  function handleLangChange(l: string) {
    setCurrentLang(l);
    if (currentQuery()) {
      doSearch(currentQuery(), currentType(), currentRegion(), l, currentTime());
      window.history.pushState({}, "", `/?q=${encodeURIComponent(currentQuery())}&type=${currentType()}&region=${currentRegion()}&lang=${l}&time=${currentTime()}`);
    }
  }

  function handleTimeChange(t: string) {
    setCurrentTime(t);
    if (currentQuery()) {
      doSearch(currentQuery(), currentType(), currentRegion(), currentLang(), t);
      window.history.pushState({}, "", `/?q=${encodeURIComponent(currentQuery())}&type=${currentType()}&region=${currentRegion()}&lang=${currentLang()}&time=${t}`);
    }
  }

  async function handleLucky(q: string) {
    setIsLoading(true);
    try {
      const url = await luckySearch(q, getEnginesForType(currentType()), currentType());
      window.location.href = url;
    } catch (e) {
      console.error(e);
      doSearch(q, "all", currentRegion(), currentLang(), currentTime());
    }
  }

  const resultsList = () => results()?.results ?? [];

  return (
    <main class="page-container">
      <div class="page-content">
        <div class="page-header">
          <h1 class="page-title">
            <Logo size="md" />
            <span>Sneaker</span>
          </h1>
          <SearchBar onSearch={handleSearch} onLucky={handleLucky} initialValue={currentQuery()} type={currentType()} region={currentRegion()} />
        </div>

        <Show when={currentQuery().length > 0}>
          <div class="results-layout">
            <div class="results-main">
              <ResultsHeader 
                activeTab={currentType()} 
                region={currentRegion()}
                lang={currentLang()}
                time={currentTime()}
                onTabChange={handleTabChange} 
                onRegionChange={handleRegionChange}
                onLangChange={handleLangChange}
                onTimeChange={handleTimeChange}
              />
              <Show when={currentType() === "maps"}>
                <Maps query={currentQuery()} region={currentRegion()} />
              </Show>
              <Show when={currentType() !== "maps"}>
                <Show when={isLoading()}>
                  <LoadingSkeleton type={currentType()} />
                </Show>
                <Show when={!isLoading()}>
                  <ResultsList results={resultsList()} currentType={currentType()} />
                </Show>
                <Show when={isLoading() === false && !results() && currentQuery().length > 0}>
                  <div class="error-message">
                    Error loading results. Please try again.
                  </div>
                </Show>
              </Show>
            </div>
            <div class="sidebar-wrapper">
              <button 
                class="sidebar-toggle" 
                onClick={() => setSidebarOpen(!sidebarOpen())}
              >
                <span>More Results</span>
                <svg 
                  class={`sidebar-toggle-icon ${sidebarOpen() ? 'open' : ''}`}
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div class={`sidebar-content ${sidebarOpen() ? 'open' : ''}`}>
                <Sidebar data={results()} />
              </div>
            </div>
          </div>
        </Show>
      </div>
    </main>
  );
}
