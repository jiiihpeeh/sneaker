import { For } from "solid-js";
import "./Tabs.css";

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "all", label: "All" },
  { id: "images", label: "Images" },
  { id: "videos", label: "Videos" },
  { id: "news", label: "News" },
  { id: "maps", label: "Maps" },
];

export function Tabs(props: TabsProps) {
  return (
    <div class="tabs-container">
      <div class="tabs">
        <For each={tabs}>
          {(tab) => (
            <button
              class={`tab ${props.activeTab === tab.id ? "active" : ""}`}
              data-type={tab.id}
              onClick={() => props.onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
