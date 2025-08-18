import React, { useEffect, useRef, useState } from "react";
import "./MapPage.css";

// 지도 JS 로더용 공개 키 (브라우저에 노출 OK)
const NAVER_KEY = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;

// 출발/도착 (광화문 → 청계천 예시)
const ORIGIN = { lat: 33.516195, lng: 126.530346 };
const DEST = { lat: 33.517944, lng: 126.545886 };

/** 네이버 지도 스크립트 로더 */
function loadNaverMaps(clientId) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.naver?.maps) {
      resolve(window.naver);
      return;
    }
    const existing = document.getElementById("naver-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.naver), {
        once: true,
      });
      existing.addEventListener("error", (e) => reject(e), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = "naver-maps-script";
    // ✅ 최근 로더 파라미터: ncpKeyId (ncpClientId도 동작)
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
  const polylineRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      try {
        if (!NAVER_KEY) {
          setMapErr("VITE_NAVER_MAPS_CLIENT_ID가 없습니다. .env를 확인하세요.");
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

        // ✅ Directions 15 경로 요청 — 로컬 서버 라우트 사용
        const pathLngLat = await fetchRoute15({
          start: { lng: ORIGIN.lng, lat: ORIGIN.lat }, // "lng,lat"
          goal: { lng: DEST.lng, lat: DEST.lat },
          option: "fast", // fast | shortest | traffics | free ...
        });
        if (cancelled) return;

        if (Array.isArray(pathLngLat) && pathLngLat.length > 1) {
          const latlngs = pathLngLat.map(
            ([lng, lat]) => new naver.maps.LatLng(lat, lng)
          );

          if (polylineRef.current) polylineRef.current.setMap(null);
          polylineRef.current = new naver.maps.Polyline({
            path: latlngs,
            strokeColor: "#FF8C42",
            strokeOpacity: 1.0,
            strokeWeight: 8,
            map,
          });

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
            strokeOpacity: 0.8,
            strokeWeight: 6,
            map,
          });
          setMapErr("길찾기 경로를 불러오지 못해 직선을 표시했어요.");
        }
      } catch (e) {
        console.error("initMap Error:", e);
        setMapErr(`지도 초기화 오류: ${e.message || e}`);
      }
    };

    initMap();
    return () => {
      cancelled = true;
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  /** 로컬 서버 프록시로 Directions 15 호출 (/api/directions15) */
  async function fetchRoute15({ start, goal, option = "fast" }) {
    try {
      const qs = new URLSearchParams({
        startLng: String(start.lng),
        startLat: String(start.lat),
        goalLng: String(goal.lng),
        goalLat: String(goal.lat),
        option,
      });
      const res = await fetch(`/api/directions15?${qs.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        console.error("[dir15] HTTP", res.status, data);
        setMapErr(
          `길찾기 오류(${res.status}): ${data?.message || "서버 오류"}`
        );
        return null;
      }

      if (!data?.ok || !Array.isArray(data?.path)) {
        console.warn("[dir15] no path in response", data);
        setMapErr("길찾기 응답에 경로가 없습니다.");
        return null;
      }
      return data.path; // [[lng,lat], ...]
    } catch (e) {
      console.error("[dir15] fetch error", e);
      setMapErr("길찾기(15) 경로 요청 실패");
      return null;
    }
  }

  // --- 이벤트 핸들러 ---
  const goMyLocation = () => {
    setMapErr("");
    if (!mapRef.current || !window.naver?.maps) {
      setMapErr("지도가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
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

  const handleStopClick = () => setIsStopModalOpen(true);
  const handleConfirmStop = () => {
    console.log("운동 종료!");
    setIsStopModalOpen(false);
  };
  const handleCancelStop = () => setIsStopModalOpen(false);

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
        <StopConfirmStopModal
          onConfirm={handleConfirmStop}
          onCancel={handleCancelStop}
        />
      )}
    </div>
  );
}

// 타이포 방지용: 모달 컴포넌트 이름 재수출
function StopConfirmStopModal(props) {
  return <StopConfirmModal {...props} />;
}
