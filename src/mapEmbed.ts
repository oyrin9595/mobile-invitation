import type { WeddingData } from "./data/wedding";

/** OpenStreetMap 퍼가기용 임베드 URL (API 키 불필요) */
export function buildOsmEmbedUrl(lat: number, lng: number, span = 0.0055): string {
  const minLon = lng - span;
  const minLat = lat - span * 0.88;
  const maxLon = lng + span;
  const maxLat = lat + span * 0.88;
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function venueMapEmbedSrc(venue: WeddingData["venue"]): string | null {
  if (venue.mapEmbedUrl) return venue.mapEmbedUrl;
  if (venue.mapPreview) {
    return buildOsmEmbedUrl(venue.mapPreview.lat, venue.mapPreview.lng);
  }
  return null;
}
