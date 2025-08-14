// src/App.jsx
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CameraCapture from "./page/CameraPage";
import MapPage from "./page/MapPage";
import GpsPage from "./page/GpsPage";
import NotificationsPage from "./page/NotificationsPage";

// 홈: 2x2 버튼 그리드
function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-wrap">
      <div className="home-card">
        <h1 className="home-title">무엇을 열까요?</h1>

        <div className="grid-buttons">
          <button className="btn primary" onClick={() => navigate("/camera")}>
            <span className="btn-emoji" aria-hidden>
              📷
            </span>
            카메라
          </button>

          <button className="btn" onClick={() => navigate("/map")}>
            <span className="btn-emoji" aria-hidden>
              🗺️
            </span>
            지도
          </button>

          <button className="btn" onClick={() => navigate("/notifications")}>
            <span className="btn-emoji" aria-hidden>
              🔔
            </span>
            알림
          </button>

          <button className="btn" onClick={() => navigate("/gps")}>
            <span className="btn-emoji" aria-hidden>
              📍
            </span>
            GPS
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/camera" element={<CameraCapture />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/gps" element={<GpsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
