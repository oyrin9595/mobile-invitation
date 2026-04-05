export {};

interface NaverLatLng {}

interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
}

interface NaverMarkerOptions {
  position: NaverLatLng;
  map: { destroy?: () => void };
  title?: string;
}

type NaverMapsApi = {
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Map: new (element: HTMLElement, options: NaverMapOptions) => { destroy?: () => void };
  Marker: new (options: NaverMarkerOptions) => void;
};

declare global {
  interface Window {
    naver?: {
      maps: NaverMapsApi;
    };
  }

  const naver: {
    maps: NaverMapsApi;
  };
}
