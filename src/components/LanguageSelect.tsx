import { createSignal, createMemo, For, Show, onMount, onCleanup } from "solid-js";
import langs from "langs";
import "./LanguageSelect.css";

const LANGUAGES = [
  { code: "", name: "🌐 Any Language" },
  ...langs.all()
    .filter((l: { 1?: string }) => l["1"])
    .map((l: { 1?: string; name: string }) => ({ code: l["1"]!, name: l.name }))
    .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)),
];

interface LanguageSelectProps {
  value: string;
  onChange: (lang: string) => void;
}

export function LanguageSelect(props: LanguageSelectProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [filter, setFilter] = createSignal("");
  let wrapperRef: HTMLDivElement | undefined;

  const filteredLanguages = createMemo(() => {
    const query = filter().toLowerCase().trim();
    if (!query) return LANGUAGES;
    return LANGUAGES.filter((l) =>
      l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query)
    );
  });

  const selectedName = createMemo(() => {
    const found = LANGUAGES.find((l) => l.code === props.value);
    return found?.name || "Any Language";
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
    <div class="language-select-wrapper" ref={wrapperRef}>
      <div
        class="language-select-trigger"
        onClick={handleInputClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen());
          }
        }}
      >
        <span class="language-select-value">{selectedName()}</span>
        <span class="language-select-arrow">▾</span>
      </div>

      <Show when={isOpen()}>
        <div class="language-select-dropdown">
          <input
            type="text"
            class="language-select-input"
            placeholder="Search languages..."
            value={filter()}
            onInput={(e) => setFilter(e.currentTarget.value)}
            onClick={(e) => e.stopPropagation()}
            ref={(el) => setTimeout(() => el.focus(), 0)}
          />
          <div class="language-select-list">
            <For each={filteredLanguages()}>
              {(lang) => (
                <div
                  class={`language-select-option ${lang.code === props.value ? "selected" : ""}`}
                  onClick={() => handleSelect(lang.code)}
                >
                  {lang.name}
                </div>
              )}
            </For>
            <Show when={filteredLanguages().length === 0}>
              <div class="language-select-empty">No languages found</div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}
