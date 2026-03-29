import { For } from "solid-js";
import type { SearchType } from "~/lib/types";
import "~/routes/index.css";

interface LoadingSkeletonProps {
  type: SearchType;
}

export function LoadingSkeleton(props: LoadingSkeletonProps) {
  if (props.type === "images") {
    return (
      <div class="skeleton-images">
        <For each={Array.from({ length: 8 })}>
          {() => (
            <div class="skeleton-image-card">
              <div class="skeleton-image-placeholder" />
              <div class="skeleton-image-title">
                <div class="skeleton-line skeleton-line-full" />
              </div>
            </div>
          )}
        </For>
      </div>
    );
  }

  if (props.type === "videos") {
    return (
      <div>
        <For each={Array.from({ length: 5 })}>
          {() => (
            <div class="skeleton-card skeleton-video">
              <div class="skeleton-video-thumb skeleton" />
              <div class="skeleton-video-info">
                <div class="skeleton-line skeleton-line-short" />
                <div class="skeleton-line skeleton-line-short" />
                <div class="skeleton-line skeleton-line-full" />
              </div>
            </div>
          )}
        </For>
      </div>
    );
  }

  if (props.type === "news") {
    return (
      <div>
        <For each={Array.from({ length: 5 })}>
          {() => (
            <div class="skeleton-card skeleton-news">
              <div class="skeleton-news-thumb skeleton" />
              <div class="skeleton-news-info">
                <div class="skeleton-line skeleton-line-short" />
                <div class="skeleton-line skeleton-line-short" />
                <div class="skeleton-line skeleton-line-full" />
              </div>
            </div>
          )}
        </For>
      </div>
    );
  }

  return (
    <div>
      <For each={Array.from({ length: 5 })}>
        {() => (
          <div class="skeleton-card skeleton-web">
            <div class="skeleton-row">
              <div class="skeleton-line skeleton-line-short" />
            </div>
            <div class="skeleton-row">
              <div class="skeleton-line skeleton-line-full" />
            </div>
            <div class="skeleton-row">
              <div class="skeleton-line skeleton-line-full" />
            </div>
            <div class="skeleton-row skeleton-sources">
              <div class="skeleton-source skeleton" />
              <div class="skeleton-source skeleton" />
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
