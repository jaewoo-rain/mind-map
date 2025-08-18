import React, { useEffect, useRef, useState } from "react";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || undefined;

// ✅ A/B 좌표 (원하는 위치로 바꿔 사용)
const ORIGIN = { lat: 37.3161984, lng: 126.7007488 }; // 용두암 근처(예시)
const DEST = { lat: 37.3432066492064, lng: 126.7360684320483 }; // 탑동광장 근처(예시)

// 구글 스크립트 로더 (geometry 포함)
function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.maps) {
      resolve(window.google);
      return;
    }
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.async = true;
    script.defer = true;
    // 👇 geometry 반드시 포함
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&v=weekly`;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function MapPage() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  // 마커/폴리라인/경로 상태
  const myMarkerRef = useRef(null);
  const aMarkerRef = useRef(null);
  const bMarkerRef = useRef(null);
  const donePolylineRef = useRef(null);
  const remainPolylineRef = useRef(null);
  const routePathRef = useRef([]); // LatLng[] (경로 전체)
  const progressIdxRef = useRef(0); // 진행 인덱스
  const watchIdRef = useRef(null);

  const [err, setErr] = useState("");

  useEffect(() => {
    let clickListener;

    const init = async () => {
      try {
        if (!GOOGLE_KEY) {
          setErr(
            "구글 지도 API 키가 없습니다. .env에 VITE_GOOGLE_MAPS_API_KEY를 설정하세요."
          );
          return;
        }
        const google = await loadGoogleMaps(GOOGLE_KEY);

        // 지도 생성
        const fallbackCenter = { lat: 33.4996, lng: 126.5312 }; // 제주
        const map = new google.maps.Map(containerRef.current, {
          center: fallbackCenter,
          zoom: 13,
          mapId: MAP_ID,
          disableDefaultUI: false,
          streetViewControl: false,
        });
        mapRef.current = map;

        // A/B 마커
        aMarkerRef.current = new google.maps.Marker({
          position: ORIGIN,
          map,
          label: "A",
        });
        bMarkerRef.current = new google.maps.Marker({
          position: DEST,
          map,
          label: "B",
        });

        // 경로 요청 (도보)
        const ds = new google.maps.DirectionsService();
        const res = await ds.route({
          origin: ORIGIN,
          destination: DEST,
          travelMode: google.maps.TravelMode.WALKING,
          provideRouteAlternatives: false,
        });

        // 스텝들을 이어붙여 path를 촘촘하게 구성
        const path = [];
        const legs = res.routes[0].legs || [];
        legs.forEach((leg) =>
          leg.steps.forEach((step) => path.push(...step.path))
        );

        routePathRef.current = path;
        progressIdxRef.current = 0;

        // 완료/남은 경로 폴리라인 생성
        donePolylineRef.current = new google.maps.Polyline({
          path: [],
          strokeColor: "#9CA3AF", // 완료: 회색
          strokeOpacity: 1,
          strokeWeight: 8,
          map,
        });
        remainPolylineRef.current = new google.maps.Polyline({
          path: path,
          strokeColor: "#2563EB", // 남은: 파랑
          strokeOpacity: 1,
          strokeWeight: 8,
          map,
        });

        // 화면 맞추기
        const bounds = new google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds);

        // 내 위치 마커(네이버 파란 점 느낌)
        myMarkerRef.current = new google.maps.Marker({
          position: path[0] || ORIGIN,
          map,
          zIndex: 9999,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        // 위치 추적 시작 — 이동할수록 남은 경로 줄이기
        if (navigator.geolocation) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const here = new google.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
              );

              // 내 위치 갱신
              myMarkerRef.current?.setPosition(here);

              // 가장 가까운 경로 인덱스 찾기
              const idx = nearestIndexOnPath(
                here,
                routePathRef.current,
                google
              );

              // 진행은 되돌리지 않음
              if (idx > progressIdxRef.current) {
                progressIdxRef.current = idx;

                const full = routePathRef.current;
                const done = full.slice(0, idx + 1);
                const remain = full.slice(idx);

                donePolylineRef.current?.setPath(done);
                remainPolylineRef.current?.setPath(remain);
              }

              // (선택) 자동 추적: 살짝 따라가게 하고 싶으면 주석 해제
              // map.panTo(here);
            },
            (e) => setErr(e.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000 }
          );
        }

        // (옵션) 클릭으로도 진행 테스트 가능
        clickListener = map.addListener("click", (e) => {
          const test = e.latLng;
          myMarkerRef.current?.setPosition(test);
          const idx = nearestIndexOnPath(test, routePathRef.current, google);
          if (idx > progressIdxRef.current) {
            progressIdxRef.current = idx;
            const full = routePathRef.current;
            donePolylineRef.current?.setPath(full.slice(0, idx + 1));
            remainPolylineRef.current?.setPath(full.slice(idx));
          }
        });
      } catch (e) {
        console.error(e);
        setErr("지도를 불러오는 중 오류가 발생했습니다.");
      }
    };

    init();

    return () => {
      if (clickListener) clickListener.remove?.();
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
      [aMarkerRef, bMarkerRef, myMarkerRef].forEach((r) => {
        r.current?.setMap(null);
        r.current = null;
      });
      donePolylineRef.current?.setMap(null);
      remainPolylineRef.current?.setMap(null);
      donePolylineRef.current = null;
      remainPolylineRef.current = null;
      mapRef.current = null;
    };
  }, []);

  const goMyLocation = () => {
    setErr("");
    if (!navigator.geolocation) {
      setErr("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        mapRef.current?.setCenter(pos);
        mapRef.current?.setZoom(16);
      },
      (e) => setErr(e.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 간단 스타일
  const wrap = {
    minHeight: "100dvh",
    background: "#0b0b0b",
    color: "#fff",
    padding: 16,
    boxSizing: "border-box",
  };
  const card = {
    background: "#111",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 16,
    maxWidth: 980,
    margin: "0 auto",
  };
  const mapBox = {
    width: "100%",
    height: "70vh",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #1f2937",
  };
  const actions = { display: "flex", gap: 8, marginTop: 12 };
  const btn = {
    appearance: "none",
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#e5e7eb",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>지도</h2>
        <div ref={containerRef} style={mapBox} />
        <div style={actions}>
          <button style={btn} onClick={goMyLocation}>
            📍 내 위치로 이동
          </button>
        </div>
        {err && <p style={{ color: "#fca5a5", marginTop: 10 }}>{err}</p>}
      </div>
    </div>
  );
}

/** 현재 위치에서 경로 배열의 가장 가까운 인덱스 찾기 */
function nearestIndexOnPath(point, path, google) {
  if (!path || path.length === 0) return 0;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = google.maps.geometry.spherical.computeDistanceBetween(
      point,
      path[i]
    );
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}
