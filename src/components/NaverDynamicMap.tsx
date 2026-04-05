import { useEffect, useRef, useState } from "react";
import { loadNaverMapScript } from "../lib/loadNaverMapScript";

const ncpKeyId = import.meta.env.VITE_NCPMAP_KEY_ID as string | undefined;

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  markerTitle?: string;
  className?: string;
  canvasClassName?: string;
};

export function NaverDynamicMap({
  lat,
  lng,
  zoom = 17,
  markerTitle,
  className,
  canvasClassName,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{ destroy?: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !ncpKeyId?.trim()) return;

    let cancelled = false;
    setError(null);

    void (async () => {
      try {
        await loadNaverMapScript(ncpKeyId.trim());
        if (cancelled || !containerRef.current) return;

        const center = new naver.maps.LatLng(lat, lng);
        const map = new naver.maps.Map(containerRef.current, {
          center,
          zoom,
        });
        mapInstanceRef.current = map;

        new naver.maps.Marker({
          position: center,
          map,
          title: markerTitle,
        });
      } catch {
        if (!cancelled) setError("네이버 지도를 불러오지 못했어요.");
      }
    })();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.destroy?.();
      mapInstanceRef.current = null;
      el.innerHTML = "";
    };
  }, [lat, lng, zoom, markerTitle, ncpKeyId]);

  if (!ncpKeyId?.trim()) return null;

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={canvasClassName}
        role="img"
        aria-label={markerTitle ? `${markerTitle} 위치 지도` : "위치 지도"}
      />
      {error ? (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--muted)", textAlign: "center" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function hasNaverMapKey(): boolean {
  return Boolean(ncpKeyId?.trim());
}
