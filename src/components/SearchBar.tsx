import { createSignal, createEffect, Show, For } from "solid-js";
import "./SearchBar.css";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onLucky?: (query: string) => void;
  initialValue?: string;
  compact?: boolean;
  type?: string;
  region?: string;
}

export function SearchBar(props: SearchBarProps) {
  const [query, setQuery] = createSignal(props.initialValue || "");
  const [suggestions, setSuggestions] = createSignal<string[]>([]);
  const [showDropdown, setShowDropdown] = createSignal(false);
  let debounceTimer: ReturnType<typeof setTimeout>;

  createEffect(() => {
    if (props.initialValue !== undefined) {
      setQuery(props.initialValue);
    }
  });

  async function fetchSuggestions(q: string) {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      if (props.type === "maps") {
        const searchQuery = props.region && props.region !== "worldwide" 
          ? `${q}, ${props.region}` 
          : q;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await res.json();
        const locations = data.map((item: { display_name: string }) => {
          const parts = item.display_name.split(",");
          if (parts.length >= 4) {
            return parts.slice(0, 4).join(",").trim();
          }
          return item.display_name;
        });
        setSuggestions(locations);
      } else {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      }
    } catch {
      setSuggestions([]);
    }
  }

  function handleInput(e: InputEvent) {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestions(value), 200);
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (query().trim()) {
      setShowDropdown(false);
      props.onSearch?.(query());
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  function selectSuggestion(suggestion: string) {
    setQuery(suggestion);
    setShowDropdown(false);
    props.onSearch?.(suggestion);
  }

  function handleLucky(e: MouseEvent) {
    e.preventDefault();
    if (query().trim()) {
      setShowDropdown(false);
      props.onLucky?.(query());
    }
  }

  return (
    <div class={`search-bar ${props.compact ? "compact" : ""}`}>
      <form class={`search-form ${!props.compact ? "with-buttons" : ""}`} onSubmit={handleSubmit}>
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            class="search-input"
            value={query()}
            onInput={handleInput}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={handleKeyDown}
            name="q"
            autocomplete="off"
            autofocus={!props.compact}
            placeholder={props.type === "maps" ? "Search for a place..." : "Search the web..."}
          />
          <Show when={!props.compact}>
            <div class="search-buttons">
              <button 
                type="submit" 
                class="search-button search-button-primary"
              >
                Sneaker Search
              </button>
              <button 
                type="button" 
                class="search-button search-button-secondary"
                onClick={handleLucky}
              >
                Take a Sneak
              </button>
            </div>
          </Show>
        </div>
        
        <Show when={showDropdown() && suggestions().length > 0}>
          <div class="suggestions-dropdown">
            <For each={suggestions()}>
              {(suggestion) => (
                <button
                  type="button"
                  class="suggestion-item"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              )}
            </For>
          </div>
        </Show>
      </form>
    </div>
  );
}
