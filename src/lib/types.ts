export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  thumbnail?: string;
  imageUrl?: string;
  duration?: string;
}

export interface ScoredResult extends SearchResult {
  score: number;
  sources: string[];
}

export interface SearchResponse {
  results: ScoredResult[];
  atAGlance: ScoredResult | null;
  query: string;
  totalTime: number;
  type: SearchType;
  engineTimings: EngineTiming[];
  relatedSearches: string[];
  knowledgePanel: KnowledgePanel | null;
  slotPanels?: SlotPanelResult[];
}

export interface KnowledgePanel {
  title: string;
  description: string;
  image?: string;
  url: string;
  facts?: Record<string, string>;
}

export interface EngineTiming {
  name: string;
  time: number;
  resultCount: number;
}

export interface SlotPanelResult {
  id: string;
  title?: string;
  html: string;
  position: string;
}

export type SearchType = "all" | "images" | "videos" | "news" | "maps";

export interface EngineConfig {
  [key: string]: boolean;
}

export interface EngineInfo {
  id: string;
  displayName: string;
  disabledByDefault?: boolean;
  searchType?: string;
}

export interface ExtensionMeta {
  id: string;
  displayName: string;
  description: string;
  type: string;
  configurable: boolean;
  settingsSchema: SettingField[];
  settings: Record<string, string | string[]>;
  defaultEnabled?: boolean;
}

export interface SettingField {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "toggle" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  description?: string;
  secret?: boolean;
  options?: string[];
}
