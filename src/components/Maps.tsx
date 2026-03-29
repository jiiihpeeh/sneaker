import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import "./Maps.css";

interface MapsProps {
  query: string;
  region?: string;
}

export function Maps(props: MapsProps) {
  let mapContainer: HTMLDivElement | undefined;
  let map: any;
  let marker: any;
  let pendingQuery: string | null = null;

  const [lat, setLat] = createSignal(51.505);
  const [lon, setLon] = createSignal(-0.09);
  const [zoom] = createSignal(13);
  const [loading, setLoading] = createSignal(true);

  const performSearch = (q: string) => {
    if (!map) {
      pendingQuery = q;
      return;
    }

    const searchQuery = props.region && props.region !== "worldwide" 
      ? `${q}, ${props.region}` 
      : q;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat: newLat, lon: newLon } = data[0];
          const newLatNum = parseFloat(newLat);
          const newLonNum = parseFloat(newLon);
          
          setLat(newLatNum);
          setLon(newLonNum);
          map.setView([newLatNum, newLonNum], 15);
          marker.setLatLng([newLatNum, newLonNum]);
        }
      })
      .catch(e => {
        console.error("Geocoding error:", e);
      });
  };

  onMount(async () => {
    const L = await import("leaflet");

    if (mapContainer) {
      map = L.map(mapContainer).setView([lat(), lon()], zoom());

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      marker = L.marker([lat(), lon()], { draggable: true }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setLat(pos.lat);
        setLon(pos.lng);
      });

      setLoading(false);

      if (pendingQuery) {
        performSearch(pendingQuery);
        pendingQuery = null;
      } else if (props.query) {
        performSearch(props.query);
      }
    }
  });

  createEffect(() => {
    const q = props.query;
    if (!q) return;
    performSearch(q);
  });

  onCleanup(() => {
    if (map) {
      map.remove();
    }
  });

  const openInOSM = () => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat()}&mlon=${lon()}#map=${zoom()}/${lat()}/${lon()}`, "_blank");
  };

  return (
    <div class="maps-container">
      <div class="maps-wrapper">
        <div ref={mapContainer} class="maps-map" />
        {loading() && (
          <div class="maps-loading">Loading map...</div>
        )}
      </div>
      <div class="maps-controls">
        <button class="maps-btn" onClick={openInOSM}>
          Open in OpenStreetMap
        </button>
        <div class="maps-coords">
          {lat().toFixed(4)}, {lon().toFixed(4)}
        </div>
      </div>
    </div>
  );
}
