import type { WeddingData } from "./data/wedding";

/** map.naver.com 장소 URL에서 place ID 추출 (예: …/place/2070513853) */
export function extractNaverPlaceId(mapUrl: string): string | null {
  const m = mapUrl.match(/\/place\/(\d+)/);
  return m?.[1] ?? null;
}

/** WGS84 → EPSG:3857 (네이버 지도 v5 `c=` 파라미터와 동일 체계) */
function wgs84ToWebMercator(lat: number, lng: number): { x: number; y: number } {
  const x = (lng * 20037508.34) / 180;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  return { x, y };
}

/**
 * 네이버 지도 v5 — 해당 좌표를 중심으로 한 지도 화면
 * (`/p/embed/place/` 는 검색·앱형 UI만 보이는 경우가 많아 사용하지 않음)
 */
export function buildNaverV5MapUrl(lat: number, lng: number, zoom = 17): string {
  const { x, y } = wgs84ToWebMercator(lat, lng);
  const c = `${x},${y},${zoom},0,0,0,dh`;
  return `https://map.naver.com/v5/?c=${c}`;
}

/** OpenStreetMap — 좌표도 없고 네이버 퍼가기 URL도 없을 때만 */
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
    return buildNaverV5MapUrl(venue.mapPreview.lat, venue.mapPreview.lng);
  }

  const placeId = extractNaverPlaceId(venue.mapUrl);
  if (placeId) {
    return `https://map.naver.com/v5/entry/place/${placeId}`;
  }

  return null;
}
