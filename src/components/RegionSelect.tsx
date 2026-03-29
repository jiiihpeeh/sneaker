import { createSignal, createMemo, For, Show, onMount, onCleanup } from "solid-js";
import { getCodeList } from "country-list";
import "./RegionSelect.css";

const codeList = getCodeList();

function codeToFlag(code: string): string {
  if (code.length !== 2) return "";
  const offset = 127397;
  const chars = [...code.toUpperCase()].map((c) => c.codePointAt(0)! + offset);
  return String.fromCodePoint(...chars);
}

const REGIONS = [
  { code: "worldwide", name: "🌐 Worldwide" },
  ...Object.entries(codeList)
    .map(([code, name]) => ({ code: code.toLowerCase(), name: `${codeToFlag(code)}  ${name}` }))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

interface RegionSelectProps {
  value: string;
  onChange: (region: string) => void;
}

export function RegionSelect(props: RegionSelectProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [filter, setFilter] = createSignal("");
  let wrapperRef: HTMLDivElement | undefined;

  const filteredRegions = createMemo(() => {
    const query = filter().toLowerCase().trim();
    if (!query) return REGIONS;
    return REGIONS.filter((r) =>
      r.name.toLowerCase().includes(query) || r.code.toLowerCase().includes(query)
    );
  });

  const selectedName = createMemo(() => {
    const found = REGIONS.find((r) => r.code === props.value);
    return found?.name || "Select Region";
  });

  function handleSelect(code: string) {
    props.onChange(code);
    setIsOpen(false);
    setFilter("");
  }

  function handleInputClick(e: MouseEvent) {
    e.stopPropagation();
    setIsOpen(!isOpen());
  }

  function handleClickOutside(e: MouseEvent) {
    if (wrapperRef && !wrapperRef.contains(e.target as Node)) {
      setIsOpen(false);
      setFilter("");
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  return (
    <div class="region-select-wrapper" ref={wrapperRef}>
      <div
        class="region-select-trigger"
        onClick={handleInputClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen());
          }
        }}
      >
        <span class="region-select-value">{selectedName()}</span>
        <span class="region-select-arrow">▾</span>
      </div>

      <Show when={isOpen()}>
        <div class="region-select-dropdown">
          <input
            type="text"
            class="region-select-input"
            placeholder="Search regions..."
            value={filter()}
            onInput={(e) => setFilter(e.currentTarget.value)}
            onClick={(e) => e.stopPropagation()}
            ref={(el) => setTimeout(() => el.focus(), 0)}
          />
          <div class="region-select-list">
            <For each={filteredRegions()}>
              {(region) => (
                <div
                  class={`region-select-option ${region.code === props.value ? "selected" : ""}`}
                  onClick={() => handleSelect(region.code)}
                >
                  {region.name}
                </div>
              )}
            </For>
            <Show when={filteredRegions().length === 0}>
              <div class="region-select-empty">No regions found</div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}
