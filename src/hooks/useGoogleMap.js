import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, nearestIndexOnPath } from "../utils/googleMapsUtils";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || undefined;

export default function useGoogleMap({ mapContainerRef, origin, destination }) {
  const [mapErr, setMapErr] = useState("");
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const progressIdxRef = useRef(0);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = async () => {
      try {
        if (!GOOGLE_KEY) {
          setMapErr("구글 지도 API 키가 없습니다. .env 파일을 확인하세요.");
          return;
        }
        const google = await loadGoogleMaps(GOOGLE_KEY);

        const map = new google.maps.Map(mapContainerRef.current, {
          center: origin,
          zoom: 15,
          mapId: MAP_ID,
          disableDefaultUI: true,
        });
        mapRef.current = map;

        new google.maps.Marker({ position: origin, map, label: "A" });
        new google.maps.Marker({ position: destination, map, label: "B" });

        const ds = new google.maps.DirectionsService();
        const res = await ds.route({
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.WALKING,
        });

        const routePath = res.routes[0].legs.flatMap((leg) =>
          leg.steps.flatMap((step) => step.path)
        );

        const donePolyline = new google.maps.Polyline({
          path: [],
          strokeColor: "#6b7280",
          strokeOpacity: 1.0,
          strokeWeight: 8,
          map,
        });
        const remainPolyline = new google.maps.Polyline({
          path: routePath,
          strokeColor: "#FF8C42",
          strokeOpacity: 1.0,
          strokeWeight: 8,
          map,
        });

        const bounds = new google.maps.LatLngBounds();
        routePath.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds);

        const myMarker = new google.maps.Marker({
          position: routePath[0] || origin,
          map,
          zIndex: 99,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
          },
        });

        if (navigator.geolocation) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const here = new google.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
              );
              myMarker.setPosition(here);
              const idx = nearestIndexOnPath(here, routePath, google);

              if (idx > progressIdxRef.current) {
                progressIdxRef.current = idx;
                donePolyline.setPath(routePath.slice(0, idx + 1));
                remainPolyline.setPath(routePath.slice(idx));
              }
            },
            (e) => setMapErr(`위치 정보를 가져올 수 없습니다: ${e.message}`),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
          );
        }
      } catch (e) {
        console.error(e);
        setMapErr("지도를 불러오는 중 오류가 발생했습니다.");
      }
    };

    initMap();

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [mapContainerRef, origin, destination]);

  return { mapRef, mapErr };
}
