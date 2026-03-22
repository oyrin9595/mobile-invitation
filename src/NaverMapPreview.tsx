import { useEffect, useRef } from "react";
import { loadNaverMapSdk, type NaverMapScriptQuery } from "./naverMapSdk";
import styles from "./WeddingInvite.module.css";

type NaverMaps = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
    LatLng: new (lat: number, lng: number) => unknown;
    Marker: new (opts: { position: unknown; map: unknown }) => void;
    Event: { clearInstanceListeners: (target: unknown) => void };
  };
};

type Props = {
  clientId: string;
  scriptQuery: NaverMapScriptQuery;
  lat: number;
  lng: number;
  zoom?: number;
};

export function NaverMapPreview({ clientId, scriptQuery, lat, lng, zoom = 17 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !clientId) return;

    let cancelled = false;

    loadNaverMapSdk(clientId, scriptQuery)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const naver = (window as unknown as { naver: NaverMaps }).naver;
        if (!naver?.maps) {
          if (import.meta.env.DEV) {
            console.warn("[NaverMapPreview] window.naver.maps 없음 — 스크립트·인증키 확인");
          }
          return;
        }

        try {
          const center = new naver.maps.LatLng(lat, lng);
          const map = new naver.maps.Map(el, {
            center,
            zoom,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
          });
          mapRef.current = map;
          new naver.maps.Marker({ position: center, map });
        } catch (e) {
          if (import.meta.env.DEV) console.warn("[NaverMapPreview] 지도 생성 실패", e);
        }
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn(
            "[NaverMapPreview] SDK 로드 실패. 도메인 등록·Client ID·ncpClientId vs ncpKeyId를 확인하세요.",
            err
          );
        }
      });

    return () => {
      cancelled = true;
      const map = mapRef.current;
      mapRef.current = null;
      if (map) {
        try {
          const naver = (window as unknown as { naver: NaverMaps }).naver;
          naver?.maps?.Event?.clearInstanceListeners?.(map);
        } catch {
          /* */
        }
      }
      el.innerHTML = "";
    };
  }, [clientId, scriptQuery, lat, lng, zoom]);

  return (
    <div className={styles.mapPreviewWrapNaver}>
      <div
        ref={containerRef}
        className={styles.naverMapCanvas}
        role="img"
        aria-label="네이버 지도 위치 미리보기"
      />
    </div>
  );
}
