import { Tabs } from "~/components/Tabs";
import { RegionSelect } from "~/components/RegionSelect";
import { LanguageSelect } from "~/components/LanguageSelect";
import { TimeSelect } from "~/components/TimeSelect";
import type { SearchType } from "~/lib/types";
import "./ResultsHeader.css";

interface ResultsHeaderProps {
  activeTab: SearchType;
  region: string;
  lang: string;
  time: string;
  onTabChange: (tab: string) => void;
  onRegionChange: (region: string) => void;
  onLangChange: (lang: string) => void;
  onTimeChange: (time: string) => void;
}

export function ResultsHeader(props: ResultsHeaderProps) {
  return (
    <div class="results-header">
      <Tabs activeTab={props.activeTab} onTabChange={props.onTabChange} />
      <div class="results-filters">
        <TimeSelect value={props.time} onChange={props.onTimeChange} />
        <RegionSelect value={props.region} onChange={props.onRegionChange} />
        <LanguageSelect value={props.lang} onChange={props.onLangChange} />
      </div>
    </div>
  );
}
