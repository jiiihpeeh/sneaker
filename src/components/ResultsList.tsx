import { createSignal, For, Show, Switch, Match } from "solid-js";
import { Film } from "lucide-solid";
import type { ScoredResult } from "~/server/types";
import "./ResultsList.css";

interface ResultsListProps {
  results: ScoredResult[];
  currentType: string;
}

function ImagePreview(props: { result: ScoredResult; onClose: () => void }) {
  const copyToClipboard = () => {
    const text = props.result.imageUrl || props.result.thumbnail || props.result.url;
    navigator.clipboard.writeText(text);
  };

  return (
    <div class="image-preview-overlay" onClick={props.onClose}>
      <div class="image-preview-content" onClick={(e) => e.stopPropagation()}>
        <button class="image-preview-close" onClick={props.onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <img 
          src={props.result.imageUrl || props.result.thumbnail} 
          alt={props.result.title}
          class="image-preview-img"
        />
        <div class="image-preview-info">
          <h3 class="image-preview-title">{props.result.title}</h3>
          <div class="image-preview-actions">
            <a 
              href={props.result.imageUrl || props.result.thumbnail} 
              target="_blank" 
              rel="noopener noreferrer"
              class="image-preview-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open Image
            </a>
            <a 
              href={props.result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              class="image-preview-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              View Page
            </a>
            <button 
              class="image-preview-btn"
              onClick={copyToClipboard}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultsList(props: ResultsListProps) {
  const [selectedImage, setSelectedImage] = createSignal<ScoredResult | null>(null);

  return (
    <div class="results-list">
      <Show when={selectedImage()}>
        <ImagePreview 
          result={selectedImage()!} 
          onClose={() => setSelectedImage(null)} 
        />
      </Show>
      <Show when={props.results.length === 0}>
        <div class="no-results">
          <p>No results found for your query.</p>
        </div>
      </Show>

      <Switch>
        <Match when={props.currentType === "images"}>
          <div class="image-grid">
            <For each={props.results}>
              {(result) => <ImageResult result={result} onPreview={setSelectedImage} />}
            </For>
          </div>
        </Match>
        <Match when={props.currentType === "videos"}>
          <div class="video-results">
            <For each={props.results}>
              {(result) => <VideoResult result={result} />}
            </For>
          </div>
        </Match>
        <Match when={props.currentType === "news"}>
          <div class="news-results">
            <For each={props.results}>
              {(result) => <NewsResult result={result} />}
            </For>
          </div>
        </Match>
        <Match when={true}>
          <div class="web-results">
            <For each={props.results}>
              {(result) => <WebResult result={result} />}
            </For>
          </div>
        </Match>
      </Switch>
    </div>
  );
}

function ImageResult(props: { result: ScoredResult; onPreview: (r: ScoredResult) => void }) {
  const { result } = props;

  return (
    <button
      class="image-result"
      onClick={() => props.onPreview(result)}
    >
      <Show when={result.thumbnail || result.imageUrl}>
        <img
          src={result.imageUrl || result.thumbnail}
          alt={result.title}
          loading="lazy"
        />
      </Show>
      <div class="image-result-title">
        {result.title}
      </div>
    </button>
  );
}

function VideoResult(props: { result: ScoredResult }) {
  const { result } = props;
  const [imageError, setImageError] = createSignal(false);

  const hasThumbnail = () => result.thumbnail || result.imageUrl;

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      class="video-result"
    >
      <div classList={{ "video-thumbnail": true, "img-error": !hasThumbnail() || imageError() }}>
        <Show when={hasThumbnail() && !imageError()}>
          <img
            src={result.imageUrl || result.thumbnail}
            alt={result.title}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </Show>
        <div class="video-thumbnail-fallback">
          <Film size={40} />
        </div>
        <Show when={result.duration && hasThumbnail() && !imageError()}>
          <span class="video-duration">{result.duration}</span>
        </Show>
      </div>
      <div class="video-info">
        <p class="video-title">{result.title}</p>
        <Show when={result.sources?.length > 0}>
          <p class="video-source">{result.sources[0]}</p>
        </Show>
        <p class="video-snippet">{result.snippet}</p>
      </div>
    </a>
  );
}

function NewsResult(props: { result: ScoredResult }) {
  const { result } = props;

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      class="news-result"
    >
      <Show when={result.thumbnail || result.imageUrl}>
        <div class="news-thumbnail">
          <img
            src={result.imageUrl || result.thumbnail}
            alt={result.title}
            loading="lazy"
          />
        </div>
      </Show>
      <div class="news-info">
        <p class="news-title">{result.title}</p>
        <div class="news-sources">
          <For each={result.sources}>
            {(source) => <span class="news-source">{source}</span>}
          </For>
        </div>
        <p class="news-snippet">{result.snippet}</p>
      </div>
    </a>
  );
}

function DisplayUrl(props: { url: string }) {
  const displayUrl = () => {
    try {
      const url = new URL(props.url);
      return url.hostname + (url.pathname !== '/' ? url.pathname : '');
    } catch {
      return props.url;
    }
  };

  return (
    <div class="web-result-url">
      <a
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        title={props.url}
        class="web-result-url-inner"
      >
        {displayUrl()}
      </a>
    </div>
  );
}

function WebResult(props: { result: ScoredResult }) {
  const { result } = props;

  return (
    <article class="web-result">
      <div class="web-result-title">
        <Show when={result.thumbnail}>
          <img
            src={result.thumbnail}
            alt=""
            width="16"
            height="16"
          />
        </Show>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {result.title}
        </a>
      </div>
      <DisplayUrl url={result.url} />
      <p class="web-result-snippet">{result.snippet}</p>
      <div class="web-result-sources">
        <For each={result.sources}>
          {(source) => (
            <span class="source-tag">{source}</span>
          )}
        </For>
      </div>
    </article>
  );
}
