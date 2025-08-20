// src/pages/FinishRunningPage.jsx
import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import BottomBar from "../components/BottomBar.jsx";

// 시간 포맷팅 헬퍼 함수
const formatTime = (timeInSeconds) => {
  if (timeInSeconds === undefined || timeInSeconds === null) return "00:00:00";
  const hours = Math.floor(timeInSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// 페이스 포맷팅 헬퍼 함수
const formatPace = (paceInMinutes) => {
  if (
    paceInMinutes === undefined ||
    paceInMinutes === null ||
    paceInMinutes === 0 ||
    !isFinite(paceInMinutes)
  ) {
    return "0'00''";
  }
  const minutes = Math.floor(paceInMinutes);
  const seconds = Math.round((paceInMinutes - minutes) * 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}'${seconds}''`;
};

// 이미지 캐러셀 컴포넌트
const ImageCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  // 캐러셀에 들어갈 이미지 (예시)
  const slides = [
    <img
      key="map"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        userSelect: "none",
      }}
      src="https://placehold.co/328x328/FF8C42/white?text=Map"
      alt="map"
    />,
    <img
      key="photo"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        userSelect: "none",
      }}
      src="https://placehold.co/328x328/eee/ccc?text=Photo"
      alt="photo"
    />,
  ];

  // 스크롤 위치에 따라 인디케이터 업데이트
  const handleScroll = () => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.offsetWidth;
      const currentSlide = Math.round(
        scrollRef.current.scrollLeft / slideWidth
      );
      if (currentSlide !== activeSlide) {
        setActiveSlide(currentSlide);
      }
    }
  };

  // 인디케이터 클릭 시 해당 슬라이드로 이동
  const scrollToSlide = (index) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });
    }
  };

  // 드래그/터치 시작
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const pageX = e.type === "touchstart" ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
  };

  // 드래그/터치 종료
  const handleDragEnd = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  // 드래그/터치 중 이동
  const handleDragMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const pageX = e.type === "touchmove" ? e.touches[0].pageX : e.pageX;
    const x = pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 스와이프 속도 조절
    scrollRef.current.scrollLeft = scrollLeftStart - walk;
  };

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        position: "relative",
        cursor: "grab",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleDragStart}
        onMouseLeave={handleDragEnd}
        onMouseUp={handleDragEnd}
        onMouseMove={handleDragMove}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragMove}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{ width: "100%", flexShrink: 0, scrollSnapAlign: "center" }}
          >
            {slide}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 17,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          zIndex: 1,
        }}
      >
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => scrollToSlide(index)}
            style={{
              width: 8,
              height: 8,
              background: activeSlide === index ? "#FF8C42" : "#FFFFFF",
              borderRadius: 9999,
              cursor: "pointer",
              transition: "background 150ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 러닝 완료 페이지 컴포넌트
export default function FinishRunningPage() {
  const location = useLocation();
  // location.state가 없을 경우를 대비한 기본값 (테스트용)
  const { elapsedTime, distance, calories, pace } = location.state || {
    elapsedTime: 2715, // 예시: 45분 15초
    distance: 5.21,
    calories: 350,
    pace: 8.68, // km/h
  };

  // 페이스 계산 (km/h -> min/km)
  const paceMinPerKm = pace > 0 ? 60 / pace : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        background: "white",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div
          style={{
            padding: "18px 16px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          {/* 코스 정보 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: "#888888", fontSize: 12, fontWeight: 500 }}>
                오늘 - 오전 7:40
              </div>
              <div style={{ color: "black", fontSize: 22, fontWeight: 600 }}>
                제주 아름다운 해안 코스
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 19 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    color: "black",
                    fontSize: 64,
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {distance.toFixed(2)}
                </div>
                <div style={{ color: "#C4C4C6", fontSize: 12 }}>킬로미터</div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <div
                    style={{ color: "#1E1E22", fontSize: 22, fontWeight: 600 }}
                  >
                    {formatPace(paceMinPerKm)}
                  </div>
                  <div style={{ color: "#C4C4C6", fontSize: 12 }}>
                    평균 페이스
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <div
                    style={{ color: "#1E1E22", fontSize: 22, fontWeight: 600 }}
                  >
                    {formatTime(elapsedTime)}
                  </div>
                  <div style={{ color: "#C4C4C6", fontSize: 12 }}>시간</div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <div
                    style={{ color: "#1E1E22", fontSize: 22, fontWeight: 600 }}
                  >
                    {Math.round(calories)}
                  </div>
                  <div style={{ color: "#C4C4C6", fontSize: 12 }}>칼로리</div>
                </div>
              </div>
            </div>
          </div>

          <ImageCarousel />

          <button
            style={{
              maxWidth: 206,
              margin: "20px auto 0",
              width: "100%",
              padding: "10px 12px",
              background: "var(--main, #FF8C42)",
              borderRadius: 30,
              border: "none",
              cursor: "pointer",
              color: "#FCFCFC",
              fontSize: 15,
              fontFamily: "Pretendard",
              fontWeight: "700",
            }}
          >
            공유하기
          </button>
        </div>
      </main>

      <div style={{ flexShrink: 0 }}>
        <BottomBar activeTab="running" />
      </div>
    </div>
  );
}
