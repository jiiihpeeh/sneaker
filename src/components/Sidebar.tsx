import { For, Show } from "solid-js";
import type { KnowledgePanel, SearchResponse } from "~/lib/types";
import "./Sidebar.css";

interface SidebarProps {
  data: SearchResponse | null;
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside class="sidebar">
      <Show when={props.data?.knowledgePanel}>
        <KnowledgePanelCard panel={props.data!.knowledgePanel!} />
      </Show>

      <Show when={props.data?.relatedSearches && props.data.relatedSearches.length > 0}>
        <RelatedSearches queries={props.data!.relatedSearches} />
      </Show>

      <Show when={props.data?.engineTimings && props.data.engineTimings.length > 0}>
        <EngineStats timings={props.data!.engineTimings} totalTime={props.data!.totalTime} />
      </Show>
    </aside>
  );
}

function KnowledgePanelCard(props: { panel: KnowledgePanel }) {
  return (
    <div class="sidebar-card">
      <h3 class="knowledge-panel-title">
        {props.panel.title}
      </h3>
      <Show when={props.panel.image}>
        <img 
          src={props.panel.image} 
          alt={props.panel.title}
          class="knowledge-panel-image"
        />
      </Show>
      <p class="knowledge-panel-description">
        {props.panel.description}
      </p>
      <a 
        href={props.panel.url}
        target="_blank"
        rel="noopener noreferrer"
        class="knowledge-panel-link"
      >
        Read more on Wikipedia
      </a>
    </div>
  );
}

function RelatedSearches(props: { queries: string[] }) {
  return (
    <div class="sidebar-card">
      <h3 class="sidebar-card-title">
        Related Searches
      </h3>
      <div class="related-searches">
        <For each={props.queries}>
          {(query) => (
            <a
              href={`/?q=${encodeURIComponent(query)}`}
              class="related-search-link"
            >
              {query}
            </a>
          )}
        </For>
      </div>
    </div>
  );
}

function EngineStats(props: { timings: { name: string; time: number; resultCount: number }[]; totalTime: number }) {
  return (
    <div class="sidebar-card">
      <h3 class="sidebar-card-title">
        Search Stats
      </h3>
      <p class="engine-stats-time">
        Total time: {props.totalTime}ms
      </p>
      <div class="engine-stats-list">
        <For each={props.timings}>
          {(timing) => (
            <div class="engine-stat-row">
              <span class="engine-stat-name">{timing.name}</span>
              <span class="engine-stat-detail">
                {timing.time}ms ({timing.resultCount} results)
              </span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
