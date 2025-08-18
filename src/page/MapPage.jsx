import React, { useEffect, useRef, useState } from "react";
import "./MapPage.css";

// --- 설정 변수 ---
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || undefined;

// ✅ A/B 좌표 (원하는 위치로 바꿔 사용하세요)
// 현재 위치: 경기도 시흥시
const ORIGIN = { lat: 37.38, lng: 126.8 }; // 시흥시청 근처 (예시)
const DEST = { lat: 37.3432, lng: 126.736 }; // 배곧생명공원 근처 (예시)

// --- Helper 함수들 ---

/**
 * Google Maps 스크립트를 동적으로 로드하는 함수
 * @param {string} apiKey - Google Maps API 키
 * @returns {Promise<google>} - Google Maps 객체
 */
function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.maps) {
      resolve(window.google);
      return;
    }
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      const onLoad = () => resolve(window.google);
      existingScript.addEventListener("load", onLoad);
      existingScript.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * 현재 위치에서 경로 배열의 가장 가까운 지점의 인덱스를 찾는 함수
 * @param {google.maps.LatLng} point - 현재 위치
 * @param {google.maps.LatLng[]} path - 전체 경로 배열
 * @param {google} google - Google Maps 객체
 * @returns {number} - 가장 가까운 인덱스
 */
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

// --- 컴포넌트 ---

/**
 * 종료 확인 모달 UI 컴포넌트
 */
const StopConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
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
};

/**
 * 메인 운동 트래커 컴포넌트
 */
export default function MapPage() {
  // State 정의
  const [workoutData] = useState({
    time: "00:01:08",
    distance: "0.07",
    pace: "00:00:08",
    calories: 4,
  });
  const [mapErr, setMapErr] = useState("");
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);

  // Ref 정의 (DOM 요소, 지도 객체, ID 등)
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const myMarkerRef = useRef(null);
  const donePolylineRef = useRef(null);
  const remainPolylineRef = useRef(null);
  const routePathRef = useRef([]);
  const progressIdxRef = useRef(0);
  const watchIdRef = useRef(null);

  // 지도 초기화 및 위치 추적 Effect
  useEffect(() => {
    const initMap = async () => {
      try {
        if (!GOOGLE_KEY) {
          setMapErr("구글 지도 API 키가 없습니다. .env 파일을 확인하세요.");
          return;
        }
        const google = await loadGoogleMaps(GOOGLE_KEY);

        const map = new google.maps.Map(mapContainerRef.current, {
          center: ORIGIN,
          zoom: 15,
          mapId: MAP_ID,
          disableDefaultUI: true,
        });
        mapRef.current = map;

        new google.maps.Marker({ position: ORIGIN, map, label: "A" });
        new google.maps.Marker({ position: DEST, map, label: "B" });

        const ds = new google.maps.DirectionsService();
        const res = await ds.route({
          origin: ORIGIN,
          destination: DEST,
          travelMode: google.maps.TravelMode.WALKING,
        });

        const path = res.routes[0].legs.flatMap((leg) =>
          leg.steps.flatMap((step) => step.path)
        );
        routePathRef.current = path;

        donePolylineRef.current = new google.maps.Polyline({
          path: [],
          strokeColor: "#6b7280",
          strokeOpacity: 1.0,
          strokeWeight: 8,
          map,
        });
        remainPolylineRef.current = new google.maps.Polyline({
          path: path,
          strokeColor: "#FF8C42",
          strokeOpacity: 1.0,
          strokeWeight: 8,
          map,
        });

        const bounds = new google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds);

        myMarkerRef.current = new google.maps.Marker({
          position: path[0] || ORIGIN,
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
              myMarkerRef.current?.setPosition(here);
              const idx = nearestIndexOnPath(
                here,
                routePathRef.current,
                google
              );
              if (idx > progressIdxRef.current) {
                progressIdxRef.current = idx;
                const fullPath = routePathRef.current;
                donePolylineRef.current?.setPath(fullPath.slice(0, idx + 1));
                remainPolylineRef.current?.setPath(fullPath.slice(idx));
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
  }, []);

  // --- 이벤트 핸들러 ---
  const goMyLocation = () => {
    setMapErr("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
          mapRef.current?.panTo(pos);
          mapRef.current?.setZoom(16);
        },
        (e) => setMapErr(e.message)
      );
    } else {
      setMapErr("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  const handleStopClick = () => {
    setIsStopModalOpen(true);
  };

  const handleConfirmStop = () => {
    console.log("운동을 최종 종료합니다.");
    // 실제 종료 로직 (데이터 저장, 화면 이동 등)
    setIsStopModalOpen(false);
  };

  const handleCancelStop = () => {
    setIsStopModalOpen(false);
  };

  // --- 렌더링 ---
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
          <button className="btn btn-stop" onClick={handleStopClick}>
            종료
          </button>
          <button className="btn btn-pause">멈추기</button>
        </div>
      </div>

      {isStopModalOpen && (
        <StopConfirmModal
          onConfirm={handleConfirmStop}
          onCancel={handleCancelStop}
        />
      )}
    </div>
  );
}
