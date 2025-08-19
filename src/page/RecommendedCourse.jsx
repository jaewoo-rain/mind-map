// src/MapPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./RecommendedCourse.css";
import {getDistanceFromLatLonInKm} from "../utils/location.js";
import AlertStart from "../components/AlertStart.jsx";
import AlertNotStart from "../components/AlertNotStart.jsx";

/**
 * 필요 .env
 * VITE_NAVER_CLIENT_ID=네이버지도클라이언트ID
 * (선택) VITE_TMAP_PROXY=http://localhost:4000/api/tmap/pedestrian
 */

// ────────────────────────────────────────────────────────────────────────────────
// 네이버 지도 스크립트 로더
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
    const clientParam = `ncpKeyId=${import.meta.env.VITE_NAVER_CLIENT_ID}`;
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?${clientParam}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.naver);
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// Tmap 보행자 프록시 호출
const TMAP_PROXY =
  import.meta.env.VITE_TMAP_PROXY ||
  "http://localhost:4000/api/tmap/pedestrian";

async function fetchTmapPedestrian({
  startLng,
  startLat,
  goalLng,
  goalLat,
  searchOption = "0",
}) {
  try {
    const qs = new URLSearchParams({
      startLng: String(startLng),
      startLat: String(startLat),
      goalLng: String(goalLng),
      goalLat: String(goalLat),
      searchOption: String(searchOption),
    });
    const r = await fetch(`${TMAP_PROXY}?${qs.toString()}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (!data?.ok || !Array.isArray(data?.path)) return null;
    return data.path; // [[lng,lat], ...]
  } catch (e) {
    console.error(e);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// 예시 코스 데이터
const COURSES = [ // 내꺼: 35.8368214, 127.1223943 함덕: 33.333918 126.256099
  {
    id: "c1",
    title: "아름다운 해변코스",
    desc1: "함덕해수욕장에서,",
    desc2: "000까지 가는 러닝 코스",
    origin: { name: "시작점 이름", lat:  33.333918, lng: 126.256099 },
    dest: { name: "목적지 이름", lat: 33.346847, lng: 126.249495 },
    spots: [
      { name: "금오름", lat: 33.3396, lng: 126.2545 },
      { name: "외돌개", lat: 33.3433, lng: 126.2522 },
    ],
  },
  {
    id: "c2",
    title: "숲길 힐링코스",
    desc1: "사려니숲길에서,",
    desc2: "완만한 업힐로 힐링 러닝",
    origin: { name: "출발지", lat: 33.3655, lng: 126.2692 },
    dest: { name: "도착지", lat: 33.3729, lng: 126.2621 },
    spots: [
      { name: "전망 포인트", lat: 33.3691, lng: 126.2666 },
      { name: "포토 스팟", lat: 33.3703, lng: 126.2637 },
    ],
  },
  {
    id: "c3",
    title: "올레 바다코스",
    desc1: "바닷바람 맞으며,",
    desc2: "워크/런 인터벌에 최적",
    origin: { name: "출발지", lat: 33.3521, lng: 126.2339 },
    dest: { name: "도착지", lat: 33.3587, lng: 126.2411 },
    spots: [
      { name: "뷰 포인트", lat: 33.3546, lng: 126.2374 },
      { name: "카페존", lat: 33.3568, lng: 126.2392 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// 코스 카드
function CourseCard({ course, active, onClick }) {
  return (
    <button
      type="button"
      className={`course-card ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="thumbs">
        <div className="thumb" />
        <div className="thumb" />
      </div>
      <div className="title">{course.title}</div>
      <div className="desc">
        <div>{course.desc1}</div>
        <div>{course.desc2}</div>
      </div>
      <div className="divider" />
      <div className="chips">
        {course.spots.slice(0, 2).map((s) => (
          <span key={s.name} className="chip">
            {s.name}
          </span>
        ))}
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
export default function RecommendedCourse() {
  const NAVER_KEY = import.meta.env.VITE_NAVER_CLIENT_ID;

  // 선택된 코스 인덱스
  const [idx, setIdx] = useState(0);
  const selectedCourse = useMemo(() => COURSES[idx], [idx]);

  // 오류 메시지
  const [msg, setMsg] = useState("");
  
  // 팝업 상태
  const [alertComponent, setAlertComponent] = useState(null);

  // 지도/오버레이 레퍼런스
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef({ markers: [], polylines: [] });

  // 슬라이더 스크롤/드래그 상태
  const sliderRef = useRef(null);
  const scrollTimer = useRef(null);
  const CARD_W = 240;
  const GAP = 12;

  // 드래그용 상태
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastT: 0,
    vX: 0, // flick 판별용 수평 속도(px/ms)
    didMove: false,
  });

  // ── 공용 스냅 함수
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const snapToNearest = (useVelocity = true) => {
    const el = sliderRef.current;
    if (!el) return;
    const step = CARD_W + GAP;
    let target = Math.round(el.scrollLeft / step);

    if (useVelocity) {
      const v = dragRef.current.vX; // +면 오른쪽으로 드래그(콘텐츠 왼쪽으로 스크롤)
      const speed = Math.abs(v);
      if (speed > 0.7) {
        // flick: 다음/이전 카드로 튕김
        target += v < 0 ? 1 : -1;
      }
    }
    target = clamp(target, 0, COURSES.length - 1);
    setIdx(target);
    el.scrollTo({ left: target * step, behavior: "smooth" });
  };

  // ── 가로 스크롤 디바운스 → 스냅
  const onSliderScroll = () => {
    if (!sliderRef.current) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      snapToNearest(false); // 스크롤만 했을 때는 속도 고려 X
    }, 120);
  };

  // ── 포인터 드래그 핸들러 (마우스/터치 겸용)
  const onPointerDown = (e) => {
    const el = sliderRef.current;
    if (!el) return;
    dragRef.current.isDown = true;
    dragRef.current.didMove = false;
    const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    dragRef.current.startX = x;
    dragRef.current.startScrollLeft = el.scrollLeft;
    dragRef.current.lastX = x;
    dragRef.current.lastT = performance.now();
    dragRef.current.vX = 0;

    el.classList.add("dragging");
    // 모바일 브라우저에서 수평 제스처를 우리가 처리
    // (CSS: touch-action: pan-y; 도 함께 사용)
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.isDown) return;
    const el = sliderRef.current;
    if (!el) return;

    const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const dx = x - dragRef.current.startX;
    if (Math.abs(dx) > 2) dragRef.current.didMove = true;

    // 드래그 방향 반대로 스크롤 이동
    el.scrollLeft = dragRef.current.startScrollLeft - dx;

    // 속도 추정 (px/ms)
    const now = performance.now();
    const dt = now - dragRef.current.lastT || 1;
    dragRef.current.vX = (x - dragRef.current.lastX) / dt;
    dragRef.current.lastX = x;
    dragRef.current.lastT = now;
  };

  const onPointerUp = (e) => {
    const el = sliderRef.current;
    if (!el) return;
    dragRef.current.isDown = false;
    el.classList.remove("dragging");
    el.releasePointerCapture?.(e.pointerId);

    // 드래그가 있었으면 스냅 (속도 고려)
    if (dragRef.current.didMove) {
      snapToNearest(true);
    }
  };

  // 네이버 지도 초기화
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!NAVER_KEY) {
          setMsg("VITE_NAVER_CLIENT_ID(.env)이 없습니다.");
          return;
        }
        const naver = await loadNaverMaps(NAVER_KEY);
        if (cancelled) return;

        const center = new naver.maps.LatLng(
          COURSES[0].origin.lat,
          COURSES[0].origin.lng
        );

        const map = new naver.maps.Map(mapContainerRef.current, {
          center,
          zoom: 15,
          logoControl: true,
          mapDataControl: false,
        });
        mapRef.current = map;

        await drawCourse(COURSES[0]);
      } catch (e) {
        console.error(e);
        setMsg(`지도 초기화 실패: ${e?.message || e}`);
      }
    })();

    return () => {
      cancelled = true;
      clearOverlays();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 코스 변경 → 경로 다시 그림
  useEffect(() => {
    if (!mapRef.current) return;
    drawCourse(selectedCourse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse?.id]);

  // 카드 클릭 → 선택/지도 이동
  const selectCourse = (i) => {
    // 드래그 직후의 "클릭"은 무시 (오동작 방지)
    if (dragRef.current.didMove) return;
    setIdx(i);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: i * (CARD_W + GAP),
        behavior: "smooth",
      });
    }
  };

  // 내 위치 이동
  const goMyLocation = () => {
    setMsg("");
    if (!mapRef.current || !window.naver?.maps) {
      setMsg("지도가 아직 준비되지 않았어요.");
      return;
    }
    if (!navigator.geolocation) {
      setMsg("이 브라우저는 위치 정보를 지원하지 않습니다.");
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
      (e) => setMsg(e.message || "내 위치를 가져오지 못했어요."),
      { enableHighAccuracy: true }
    );
  };

  // 위치  정보 처리
  const handleStartRunning = () => {
    setMsg("");
    if (!navigator.geolocation) {
      setMsg("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const currentLat = p.coords.latitude;
        const currentLng = p.coords.longitude;
        const courseStartLat = selectedCourse.origin.lat;
        const courseStartLng = selectedCourse.origin.lng;

        console.log("브라우저 현재 위치:", { lat: currentLat, lng: currentLng });
        console.log("코스 시작 위치:", { lat: courseStartLat, lng: courseStartLng });

        const distanceInKm = getDistanceFromLatLonInKm(
          currentLat,
          currentLng,
          courseStartLat,
          courseStartLng
        );
        const distanceInMeters = distanceInKm * 1000;

        console.log("계산된 거리 (미터):", distanceInMeters);

        if (distanceInMeters <= 50) {
          setAlertComponent(<AlertStart onClose={() => setAlertComponent(null)} />);
        } else {
          setAlertComponent(<AlertNotStart onClose={() => setAlertComponent(null)} />);
        }
      },
      (e) => setMsg(e.message || "내 위치를 가져오지 못했어요."),
      { enableHighAccuracy: true }
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  // 지도 오버레이 관리 & 코스 그리기
  function clearOverlays() {
    const { markers, polylines } = overlaysRef.current;
    markers.forEach((m) => m.setMap(null));
    polylines.forEach((p) => p.setMap(null));
    overlaysRef.current.markers = [];
    overlaysRef.current.polylines = [];
  }

  async function drawCourse(course) {
    const naver = window.naver;
    if (!naver?.maps || !mapRef.current) return;
    setMsg("");

    clearOverlays();

    const map = mapRef.current;
    const origin = new naver.maps.LatLng(course.origin.lat, course.origin.lng);
    const dest = new naver.maps.LatLng(course.dest.lat, course.dest.lng);

    // 출/도착 마커
    const startMarker = new naver.maps.Marker({
      position: origin,
      map,
      title: course.origin.name || "출발",
      icon: {
        content: '<div class="pin black"><div class="dot white"></div></div>',
        size: new naver.maps.Size(24, 30),
        anchor: new naver.maps.Point(12, 30),
      },
    });
    const goalMarker = new naver.maps.Marker({
      position: dest,
      map,
      title: course.dest.name || "도착",
      icon: {
        content: '<div class="pin black"><div class="dot white"></div></div>',
        size: new naver.maps.Size(24, 30),
        anchor: new naver.maps.Point(12, 30),
      },
    });
    overlaysRef.current.markers.push(startMarker, goalMarker);

    // 스팟 마커(오렌지 포인트)
    course.spots?.forEach((s) => {
      const m = new naver.maps.Marker({
        position: new naver.maps.LatLng(s.lat, s.lng),
        map,
        title: s.name,
        icon: {
          content: '<div class="spot"></div>',
          size: new naver.maps.Size(14, 14),
          anchor: new naver.maps.Point(7, 7),
        },
      });
      overlaysRef.current.markers.push(m);
    });

    // 경로 구하기 (Tmap → 실패시 직선 폴백)
    let latlngs = null;
    const tmapPath = await fetchTmapPedestrian({
      startLng: course.origin.lng,
      startLat: course.origin.lat,
      goalLng: course.dest.lng,
      goalLat: course.dest.lat,
    });

    if (Array.isArray(tmapPath) && tmapPath.length > 1) {
      latlngs = tmapPath.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
    } else {
      setMsg("보행자 경로를 불러오지 못해 직선을 표시했어요.");
      latlngs = [origin, dest];
    }

    // 라인 그리기
    const line = new naver.maps.Polyline({
      path: latlngs,
      strokeColor: "#111111",
      strokeOpacity: 0.95,
      strokeWeight: 6,
      map,
    });
    overlaysRef.current.polylines.push(line);

    // 지도 범위 맞추기
    const bounds = latlngs.reduce(
      (b, ll) => (b.extend(ll), b),
      new naver.maps.LatLngBounds(latlngs[0], latlngs[0])
    );
    map.fitBounds(bounds);
  }

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="screen">
      {/* 상단 앱바 */}
      <div className="appbar">
        <div className="appbar-title">추천코스</div>
      </div>

      {/* 지도 */}
      <div ref={mapContainerRef} className="map-container" />

      {/* 지도 위 오버레이 */}
      <div className="floating-top">
        {msg && <div className="toast">{msg}</div>}
      </div>

      {/* 코스 슬라이더 */}
      <div className="carousel-wrap">
        <div
          ref={sliderRef}
          className="carousel"
          onScroll={onSliderScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          data-active-index={idx}
        >
          {COURSES.map((c, i) => (
            <div
              key={c.id}
              onClick={() => selectCourse(i)}
              className="card-click-wrap"
            >
              <CourseCard course={c} active={i === idx} />
            </div>
          ))}
          <div className="end-spacer" />
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="bottom-bar">
        <button
          className="btn primary"
          onClick={handleStartRunning}
        >
          이 코스로 달리기
        </button>
      </div>
      {alertComponent}
    </div>
  );
}