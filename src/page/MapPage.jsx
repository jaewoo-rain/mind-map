// src/MapPage.jsx
import React, { useEffect, useRef, useState } from "react";
import "./MapPage.css";

// 네이버 지도 JS 로더용 공개 키 (ncpKeyId 또는 ncpClientId)
const NAVER_KEY = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;

// 예시: 광화문 → 청계천
const ORIGIN = { lat: 37.5759, lng: 126.9768 };
const DEST = { lat: 37.5692, lng: 126.9778 };

/** 네이버 지도 스크립트 동적 로더 */
function loadNaverMaps(clientId) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.naver?.maps) {
      resolve(window.naver);
      return;
    }
    const id = "naver-maps-script";
    const existing = document.getElementById(id);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.naver), {
        once: true,
      });
      existing.addEventListener("error", (e) => reject(e), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.naver);
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

/** 종료 확인 모달 */
const StopConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay" role="dialog" aria-modal="true">
    <div className="modal-content">
      <p className="modal-title">
        달리기를 <span className="highlight">종료</span>하시겠습니까?
      </p>
      <div className="modal-actions">
        <button className="modal-btn cancel" onClick={onCancel}>
          계속 달릴래요
        </button>
        <button className="modal-btn confirm" onClick={onConfirm}>
          그만 달릴래요
        </button>
      </div>
    </div>
  </div>
);

export default function MapPage() {
  const [workoutData] = useState({
    time: "00:01:08",
    distance: "0.07",
    pace: "00:00:08",
    calories: 4,
  });
  const [mapErr, setMapErr] = useState("");
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const routeLineRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        if (!NAVER_KEY) {
          setMapErr("VITE_NAVER_MAPS_CLIENT_ID(.env)이 없습니다.");
          return;
        }
        const naver = await loadNaverMaps(NAVER_KEY);
        if (cancelled) return;

        const originLL = new naver.maps.LatLng(ORIGIN.lat, ORIGIN.lng);
        const destLL = new naver.maps.LatLng(DEST.lat, DEST.lng);

        const map = new naver.maps.Map(mapContainerRef.current, {
          center: originLL,
          zoom: 15,
          mapDataControl: false,
        });
        mapRef.current = map;

        new naver.maps.Marker({ position: originLL, map, title: "출발" });
        new naver.maps.Marker({ position: destLL, map, title: "도착" });

        // 🔌 티맵 보행자 경로 요청(서버 프록시)
        const pathLngLat = await fetchTmapPedestrian({
          startLng: ORIGIN.lng,
          startLat: ORIGIN.lat,
          goalLng: DEST.lng,
          goalLat: DEST.lat,
        });

        if (cancelled) return;

        if (Array.isArray(pathLngLat) && pathLngLat.length > 1) {
          const latlngs = pathLngLat.map(
            ([lng, lat]) => new naver.maps.LatLng(lat, lng)
          );
          // 기존 라인 제거
          if (routeLineRef.current) routeLineRef.current.setMap(null);

          routeLineRef.current = new naver.maps.Polyline({
            path: latlngs,
            strokeColor: "#0064FF",
            strokeOpacity: 0.9,
            strokeWeight: 7,
            map,
          });

          // 화면 맞추기
          const bounds = latlngs.reduce(
            (b, ll) => (b.extend(ll), b),
            new naver.maps.LatLngBounds(latlngs[0], latlngs[0])
          );
          map.fitBounds(bounds);
        } else {
          // 폴백: 직선
          new naver.maps.Polyline({
            path: [originLL, destLL],
            strokeColor: "#999",
            strokeOpacity: 0.7,
            strokeWeight: 6,
            map,
          });
          setMapErr("보행자 경로를 불러오지 못해 직선을 표시했어요.");
        }
      } catch (e) {
        console.error(e);
        setMapErr(`지도 초기화 실패: ${e.message || e}`);
      }
    };

    init();
    return () => {
      cancelled = true;
      if (routeLineRef.current) {
        routeLineRef.current.setMap(null);
        routeLineRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  async function fetchTmapPedestrian({ startLng, startLat, goalLng, goalLat }) {
    try {
      const qs = new URLSearchParams({
        startLng: String(startLng),
        startLat: String(startLat),
        goalLng: String(goalLng),
        goalLat: String(goalLat),
        searchOption: "0",
      });
      // 서버를 따로 돌린다면 절대경로로 호출해도 됩니다: http://localhost:4000/api/tmap/pedestrian
      const r = await fetch(
        `http://localhost:4000/api/tmap/pedestrian?${qs.toString()}`
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (!data?.ok || !Array.isArray(data?.path)) return null;
      return data.path; // [[lng,lat], ...]
    } catch (e) {
      console.error(e);
      setMapErr("티맵 보행자 경로 요청 실패");
      return null;
    }
  }

  // --- 버튼 핸들러 ---
  const goMyLocation = () => {
    setMapErr("");
    if (!mapRef.current || !window.naver?.maps) {
      setMapErr("지도가 아직 준비되지 않았어요.");
      return;
    }
    if (!navigator.geolocation) {
      setMapErr("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = new window.naver.maps.LatLng(
          p.coords.latitude,
          p.coords.longitude
        );
        mapRef.current.panTo(pos);
        mapRef.current.setZoom(16);
      },
      (e) => setMapErr(e.message || "내 위치를 가져오지 못했어요."),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="screen">
      <div ref={mapContainerRef} className="map-container" />

      <div className="stats-panel">
        {mapErr && <p className="error-message">{mapErr}</p>}

        <div className="stats-grid">
          <div className="stat-row">
            <div className="stat-item">
              <div className="stat-label">시간</div>
              <div className="stat-value">{workoutData.time}</div>
            </div>
            <div className="divider vertical" />
            <div className="stat-item">
              <div className="stat-label">거리(km)</div>
              <div className="stat-value">{workoutData.distance}</div>
            </div>
          </div>
          <div className="divider horizontal" />
          <div className="stat-row">
            <div className="stat-item">
              <div className="stat-label">페이스</div>
              <div className="stat-value">{workoutData.pace}</div>
            </div>
            <div className="divider vertical" />
            <div className="stat-item">
              <div className="stat-label">칼로리</div>
              <div className="stat-value">{workoutData.calories}</div>
            </div>
          </div>
        </div>

        <div className="controls">
          <button className="btn btn-location" onClick={goMyLocation}>
            📍 내 위치
          </button>
          <button
            className="btn btn-stop"
            onClick={() => setIsStopModalOpen(true)}
          >
            종료
          </button>
          <button className="btn btn-pause">멈추기</button>
        </div>
      </div>

      {isStopModalOpen && (
        <StopConfirmModal
          onConfirm={() => setIsStopModalOpen(false)}
          onCancel={() => setIsStopModalOpen(false)}
        />
      )}
    </div>
  );
}
