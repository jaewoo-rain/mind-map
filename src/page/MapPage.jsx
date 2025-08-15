import React, { useEffect, useRef, useState } from "react";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || undefined;

// 구글 스크립트 로더 (중복 로드 방지)
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function MapPage() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
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

        // 기본 중심: 제주 (권한 거부/미지원 시)
        const fallbackCenter = { lat: 33.4996, lng: 126.5312 };
        // 지도 생성
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: fallbackCenter,
          zoom: 12,
          mapId: MAP_ID, // 있으면 스타일 맵 적용
          disableDefaultUI: false,
        });

        // 클릭 시 마커 찍기
        clickListener = mapRef.current.addListener("click", (e) => {
          const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (!markerRef.current) {
            markerRef.current = new google.maps.Marker({
              position: pos,
              map: mapRef.current,
              title: "선택 위치",
              draggable: true,
            });
          } else {
            markerRef.current.setPosition(pos);
          }
        });
      } catch (e) {
        console.error(e);
        setErr("지도를 불러오는 중 오류가 발생했습니다.");
      }
    };

    init();

    return () => {
      if (clickListener) clickListener.remove();
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  const goMyLocation = async () => {
    setErr("");
    if (!navigator.geolocation) {
      setErr("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        const g = window.google;
        if (!mapRef.current || !g) return;
        mapRef.current.setCenter(pos);
        mapRef.current.setZoom(15);
        if (!markerRef.current) {
          markerRef.current = new g.maps.Marker({
            position: pos,
            map: mapRef.current,
            title: "현재 위치",
          });
        } else {
          markerRef.current.setPosition(pos);
          markerRef.current.setTitle("현재 위치");
        }
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
