import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MapPage.css";
import { getDistanceFromLatLonInKm } from "../utils/location.js";
import AlertArrive from "../components/AlertArrive.jsx";
import RunningState from "../components/RunningState.jsx";
import AlertEnd from "../components/AlertEnd.jsx";
import useWatchLocation from "../hooks/useWatchLocation.js";

const NAVER_KEY = import.meta.env.VITE_NAVER_CLIENT_ID;

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

/** RecommendedCourse → navigate 로 전달한 courseId 해석 */
function parseCourseId(raw) {
  const str = String(raw || "");
  let m = str.match(/^course_(\d+)_(\d+)$/);
  if (m) return { fileNo: m[1], lineIndex: parseInt(m[2], 10) };
  m = str.match(/^(\d+)[-_](\d+)$/);
  if (m) return { fileNo: m[1], lineIndex: parseInt(m[2], 10) };
  m = str.match(/^(\d+)$/);
  if (m) return { fileNo: m[1], lineIndex: 0 };
  return { fileNo: "5", lineIndex: 0 };
}

// ✅ 화면 실측 뷰포트 사이즈 훅 (주소창 변화 대응)
function useViewport() {
  const pick = () => ({
    w: Math.round(window.visualViewport?.width ?? window.innerWidth),
    h: Math.round(window.visualViewport?.height ?? window.innerHeight),
  });
  const [vp, setVp] = useState(pick);

  useEffect(() => {
    const onResize = () => setVp(pick());
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);
  return vp;
}

export default function RunningPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileNo, lineIndex } = parseCourseId(location.state?.courseId);

  const [mapErr, setMapErr] = useState("");
  const [courseJson, setCourseJson] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null); // [[lng,lat], ...]
  const [poiList, setPoiList] = useState([]); // [{name,lat,lng}]
  const [visitedSpots, setVisitedSpots] = useState(new Set());
  const [arrivalAlert, setArrivalAlert] = useState(null);
  const [showEndAlert, setShowEndAlert] = useState(false);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [pace, setPace] = useState(0);
  const [prevLocation, setPrevLocation] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const { location: currentLocation } = useWatchLocation();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const polyRef = useRef(null);
  const markersRef = useRef({ start: null, end: null, me: null, poi: [] });

  // ✅ 실측 뷰포트 사이즈
  const { w: vpW, h: vpH } = useViewport();

  // ✅ body 기본 여백 제거(전역 CSS 건드리지 않고)
  useEffect(() => {
    const body = document.body;
    const prevMargin = body.style.margin;
    const prevPadding = body.style.padding;
    body.style.margin = "0";
    body.style.padding = "0";
    return () => {
      body.style.margin = prevMargin;
      body.style.padding = prevPadding;
    };
  }, []);

  // ✅ 뷰포트 변화 시 지도 리사이즈
  useEffect(() => {
    const map = mapRef.current;
    if (map && window.naver?.maps) {
      window.naver.maps.Event.trigger(map, "resize");
    }
  }, [vpW, vpH]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (!isPaused && !showEndAlert) {
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused, showEndAlert]);

  // Location tracking and calculation effect
  useEffect(() => {
    if (!isPaused && !showEndAlert && currentLocation && prevLocation) {
      const newDistance = getDistanceFromLatLonInKm(
        prevLocation.latitude,
        prevLocation.longitude,
        currentLocation.latitude,
        currentLocation.longitude
      );
      if (newDistance > 0.002) {
        const newTotal = distance + newDistance;
        setDistance(newTotal);
        setCalories(newTotal * 65);
        if (newTotal > 0) setPace(elapsedTime / 60 / newTotal);
      }
    }
    setPrevLocation(currentLocation);
  }, [
    currentLocation,
    prevLocation,
    elapsedTime,
    isPaused,
    showEndAlert,
    distance,
  ]);

  // 1) 코스 JSON 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/data/course_bundles/course_${fileNo}.json`);
        if (!res.ok) throw new Error(`코스 ${fileNo}를 불러올 수 없어요.`);
        const data = await res.json();
        if (cancelled) return;

        const lines = data?.lines || [];
        const line = lines[lineIndex] || lines[0];
        if (!Array.isArray(line) || line.length < 2)
          throw new Error("경로가 비어있어요.");

        const spots = (data.spots || []).map((s) => ({
          name: s.name,
          lat: s.lat,
          lng: s.lng,
        }));
        const guides = (data.guide_points || []).map((g) => ({
          name: g.name,
          lat: g.lat,
          lng: g.lng,
        }));

        setCourseJson(data);
        setSelectedLine(line);
        setPoiList([...spots, ...guides].filter((p) => p.lat && p.lng));
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setMapErr(e.message || "코스 데이터를 불러오지 못했어요.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileNo, lineIndex]);

  // 2) 지도 초기화 & 경로/마커 그리기
  useEffect(() => {
    if (!selectedLine) return;
    let cancelled = false;

    const draw = async () => {
      try {
        if (!NAVER_KEY) {
          setMapErr("네이버 클라이언트 ID가 없습니다.");
          return;
        }
        const naver = await loadNaverMaps(NAVER_KEY);
        if (cancelled) return;

        const first = selectedLine[0]; // [lng,lat]
        const startLL = new naver.maps.LatLng(first[1], first[0]);
        const map = new naver.maps.Map(mapContainerRef.current, {
          center: startLL,
          zoom: 14,
          mapDataControl: false,
        });
        mapRef.current = map;

        if (polyRef.current) polyRef.current.setMap(null);
        Object.values(markersRef.current).forEach((m) => m?.setMap?.(null));
        markersRef.current = { start: null, end: null, me: null, poi: [] };

        const path = selectedLine.map(
          ([lng, lat]) => new naver.maps.LatLng(lat, lng)
        );
        polyRef.current = new naver.maps.Polyline({
          path,
          strokeColor: "#111111",
          strokeOpacity: 0.95,
          strokeWeight: 6,
          zIndex: 60,
          map,
        });

        const last = selectedLine[selectedLine.length - 1];
        const endLL = new naver.maps.LatLng(last[1], last[0]);
        markersRef.current.start = new naver.maps.Marker({
          position: startLL,
          map,
          title: "출발",
        });
        markersRef.current.end = new naver.maps.Marker({
          position: endLL,
          map,
          title: "도착",
        });

        const bounds = new naver.maps.LatLngBounds(path[0], path[0]);
        path.forEach((ll) => bounds.extend(ll));
        map.fitBounds(bounds, { top: 0, right: 0, bottom: 0, left: 0 }); // 꽉 차게
      } catch (e) {
        console.error(e);
        setMapErr(`지도 초기화 실패: ${e.message || e}`);
      }
    };

    draw();
    return () => {
      cancelled = true;
      if (polyRef.current) polyRef.current.setMap(null);
      Object.values(markersRef.current).forEach((m) => m?.setMap?.(null));
      markersRef.current = { start: null, end: null, me: null, poi: [] };
    };
  }, [selectedLine]);

  // 3) 사용자 위치 추적 + 스팟 근접 알림(50m)
  useEffect(() => {
    if (!poiList.length) return;
    let meMarker = null;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapRef.current && !meMarker) {
          meMarker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(lat, lng),
            map: mapRef.current,
            title: "내 위치",
            zIndex: 200,
          });
          markersRef.current.me = meMarker;
        } else if (meMarker) {
          meMarker.setPosition(new window.naver.maps.LatLng(lat, lng));
        }
        for (const p of poiList) {
          if (visitedSpots.has(p.name) || arrivalAlert) continue;
          const dM = getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng) * 1000;
          if (dM <= 50) {
            setVisitedSpots((prev) => new Set(prev).add(p.name));
            setArrivalAlert(
              <AlertArrive
                spotName={p.name}
                onClose={() => setArrivalAlert(null)}
                onTakePhoto={() => {
                  console.log(`사진찍기: ${p.name}`);
                  setArrivalAlert(null);
                }}
              />
            );
            break;
          }
        }
      },
      (err) => {
        console.error("위치 추적 오류:", err);
        setMapErr("위치 정보를 가져올 수 없습니다.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (markersRef.current.me) {
        markersRef.current.me.setMap(null);
        markersRef.current.me = null;
      }
    };
  }, [poiList, visitedSpots, arrivalAlert]);

  const handleStopClick = () => setShowEndAlert(true);
  const handleCloseEndAlert = () => setShowEndAlert(false);
  const handleEndRunning = () => (
    setShowEndAlert(false),
    navigate("/finish_run", {
      state: { elapsedTime, distance, calories, pace },
    })
  );
  const togglePause = () => setIsPaused(!isPaused);

  return (
    // ✅ CSS 없이 inline style로 전체 화면 고정 + 실측 높이 적용
    <div
      className="screen"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: `${vpH}px`,
        overflow: "hidden",
        background: "#0000", // 투명
      }}
    >
      {/* ✅ 지도 컨테이너도 inline으로 꽉 채움 */}
      <div
        ref={mapContainerRef}
        className="map-container"
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: `${vpH}px`,
        }}
      />

      {mapErr && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "rgba(220,0,0,.9)",
            color: "#fff",
            padding: 10,
            borderRadius: 6,
            fontSize: 12,
            zIndex: 300,
          }}
        >
          {mapErr}
        </div>
      )}

      {arrivalAlert}
      {showEndAlert && (
        <AlertEnd onClose={handleCloseEndAlert} onEnd={handleEndRunning} />
      )}

      <div
        style={{
          position: "absolute",
          width: 300,
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 250,
        }}
      >
        <RunningState
          onStopClick={handleStopClick}
          isPaused={isPaused}
          togglePause={togglePause}
          elapsedTime={elapsedTime}
          distance={distance}
          calories={calories}
          pace={pace}
        />
      </div>
    </div>
  );
}
