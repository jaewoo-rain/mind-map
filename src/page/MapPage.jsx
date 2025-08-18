import React, { useEffect, useRef, useState } from "react";
import "./MapPage.css";

// --- 설정 변수 ---
const NAVER_KEY = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;

// ✅ A/B 좌표 (원래 좌표로 되돌립니다)
const ORIGIN = { lat: 37.5759, lng: 126.9768 }; // 광화문 광장
const DEST = { lat: 37.5692, lng: 126.9778 }; // 청계천

// --- Helper 함수들 ---

/**
 * Naver Maps 스크립트를 동적으로 로드하는 함수
 * @param {string} clientId - Naver Maps API Client ID
 * @returns {Promise<naver.maps>} - Naver Maps 객체
 */
function loadNaverMaps(clientId) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.naver?.maps) {
      resolve(window.naver);
      return;
    }
    const existingScript = document.getElementById("naver-maps-script");
    if (existingScript) {
      const onLoad = () => resolve(window.naver);
      existingScript.addEventListener("load", onLoad);
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }
    const script = document.createElement("script");
    script.id = "naver-maps-script";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;

    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.naver);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
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

  console.log("-----------------------------");
  console.log(NAVER_KEY);
  console.log("-----------------------------");
  const [workoutData] = useState({
    time: "00:01:08",
    distance: "0.07",
    pace: "00:00:08",
    calories: 4,
  });
  const [mapErr, setMapErr] = useState("");
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);

  // Ref 정의
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // 지도 초기화 Effect
  useEffect(() => {
    const initMap = async () => {
      try {
        if (!NAVER_KEY) {
          setMapErr("네이버 지도 API 키가 없습니다. .env 파일을 확인하세요.");
          return;
        }
        const naver = await loadNaverMaps(NAVER_KEY);

        // 네이버 지도 좌표 객체 생성
        const originCoord = new naver.maps.LatLng(ORIGIN.lat, ORIGIN.lng);
        const destCoord = new naver.maps.LatLng(DEST.lat, DEST.lng);

        const map = new naver.maps.Map(mapContainerRef.current, {
          center: originCoord,
          zoom: 15,
          mapDataControl: false, // 지도 데이터 저작권 컨트롤 비활성화
        });
        mapRef.current = map;

        // 마커 생성
        new naver.maps.Marker({ position: originCoord, map, title: "A" });
        new naver.maps.Marker({ position: destCoord, map, title: "B" });

        // 경로 표시 (현재는 직선으로 표시)
        // TODO: 실제 경로를 표시하려면 Naver Directions API를 연동해야 합니다.
        new naver.maps.Polyline({
          path: [originCoord, destCoord],
          strokeColor: "#FF8C42",
          strokeOpacity: 1.0,
          strokeWeight: 8,
          map: map,
        });

        // 두 지점을 모두 포함하도록 지도 범위 조정
        const bounds = new naver.maps.LatLngBounds(originCoord, destCoord);
        map.fitBounds(bounds);
      } catch (e) {
        console.error("initMap Error:", e);
        setMapErr(`지도를 불러오는 중 오류가 발생했습니다: ${e.message || e}`);
      }
    };

    initMap();
  }, []);

  // --- 이벤트 핸들러 ---
  const goMyLocation = () => {
    setMapErr("");

    // mapRef와 naver.maps 객체가 유효한지 확인
    if (!mapRef.current || !window.naver || !window.naver.maps) {
      setMapErr("지도가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const pos = new window.naver.maps.LatLng(
            p.coords.latitude,
            p.coords.longitude
          );
          mapRef.current.panTo(pos);
          mapRef.current.setZoom(16);
        },
        (e) => setMapErr(e.message),
        { enableHighAccuracy: true }
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
