import React, { useEffect, useRef, useState } from "react";
import "./MapPage.css";

// 컴포넌트 및 훅 import
import StatsPanel from "../../components/MapPage/StatsPanel";
import Controls from "../../components/MapPage/Controls";
import StopConfirmModal from "../../components/MapPage/StopConfirmModal";
import useGoogleMap from "../../hooks/useGoogleMap";

// --- 설정 변수 ---
const ORIGIN = { lat: 37.38, lng: 126.8 };
const DEST = { lat: 37.3432, lng: 126.736 };

export default function MapPage() {
  const [workoutData] = useState({
    time: "00:01:08",
    distance: "0.07",
    pace: "00:00:08",
    calories: 4,
  });
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const mapContainerRef = useRef(null);

  // 커스텀 훅을 사용하여 지도 로직과 UI 로직을 분리
  const { mapRef, mapErr: hookMapErr } = useGoogleMap({
    mapContainerRef,
    origin: ORIGIN,
    destination: DEST,
  });

  const [mapErr, setMapErr] = useState("");
  useEffect(() => {
    setMapErr(hookMapErr);
  }, [hookMapErr]);

  // --- 이벤트 핸들러 ---
  const goMyLocation = () => {
    setMapErr("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
          // 훅에서 반환된 mapRef를 사용
          mapRef.current?.panTo(pos);
          mapRef.current?.setZoom(16);
        },
        (e) => setMapErr(e.message)
      );
    } else {
      setMapErr("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  const handleStopClick = () => setIsStopModalOpen(true);
  const handlePauseClick = () =>
    alert("멈추기 기능은 아직 구현되지 않았습니다.");
  const handleConfirmStop = () => {
    console.log("운동을 최종 종료합니다.");
    setIsStopModalOpen(false);
  };
  const handleCancelStop = () => setIsStopModalOpen(false);

  return (
    <div className="screen">
      <div ref={mapContainerRef} className="map-container" />

      <StatsPanel workoutData={workoutData} mapErr={mapErr}>
        <Controls
          onMyLocationClick={goMyLocation}
          onStopClick={handleStopClick}
          onPauseClick={handlePauseClick}
        />
      </StatsPanel>

      {isStopModalOpen && (
        <StopConfirmModal
          onConfirm={handleConfirmStop}
          onCancel={handleCancelStop}
        />
      )}
    </div>
  );
}
