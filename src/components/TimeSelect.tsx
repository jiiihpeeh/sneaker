import { createSignal, createMemo, For, Show, onMount, onCleanup } from "solid-js";
import "./TimeSelect.css";

const TIME_OPTIONS = [
  { code: "any", name: "Any time" },
  { code: "hour", name: "Past hour" },
  { code: "day", name: "Past 24 hours" },
  { code: "week", name: "Past week" },
  { code: "month", name: "Past month" },
  { code: "year", name: "Past year" },
];

interface TimeSelectProps {
  value: string;
  onChange: (time: string) => void;
}

export function TimeSelect(props: TimeSelectProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  let wrapperRef: HTMLDivElement | undefined;

  const selectedName = createMemo(() => {
    const found = TIME_OPTIONS.find((t) => t.code === props.value);
    return found?.name || "Any time";
  });

  function handleSelect(code: string) {
    props.onChange(code);
    setIsOpen(false);
  }

  function handleInputClick(e: MouseEvent) {
    e.stopPropagation();
    setIsOpen(!isOpen());
  }

  function handleClickOutside(e: MouseEvent) {
    if (wrapperRef && !wrapperRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  return (
    <div class="time-select-wrapper" ref={wrapperRef}>
      <div
        class="time-select-trigger"
        onClick={handleInputClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen());
          }
        }}
      >
        <span class="time-select-value">{selectedName()}</span>
        <span class="time-select-arrow">▾</span>
      </div>

      <Show when={isOpen()}>
        <div class="time-select-dropdown">
          <For each={TIME_OPTIONS}>
            {(time) => (
              <div
                class={`time-select-option ${time.code === props.value ? "selected" : ""}`}
                onClick={() => handleSelect(time.code)}
              >
                {time.name}
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
