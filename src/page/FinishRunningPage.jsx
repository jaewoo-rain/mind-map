import React from "react";
import { useLocation } from "react-router-dom";

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

export default function FinishRunningPage() {
  const location = useLocation();
  const {
    elapsedTime = 0,
    distance = 0,
    calories = 0,
    pace = 0,
    // mapImg, photoImg 같은 걸 넘기고 싶으면 navigate 시 state로 전달해 사용 가능
  } = location.state || {};

  // 인라인 스타일
  const S = {
    screen: {
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100dvh", // 모바일 주소창 변화 대응
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    contentScroll: {
      flex: 1,
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
    },
    contentInner: {
      width: "min(92vw, 360px)", // 본문 폭
      margin: "16px auto 160px", // 하단 버튼 높이만큼 여유 (버튼 fixed)
      display: "flex",
      flexDirection: "column",
      gap: 24,
    },
    section: { display: "flex", flexDirection: "column", gap: 16 },

    // 헤더(날짜/제목)
    date: { color: "#C4C4C6", fontSize: 12, fontWeight: 500 },
    title: {
      color: "#000",
      fontSize: "clamp(18px, 5.8vw, 22px)",
      fontWeight: 600,
      lineHeight: 1.25,
    },

    // 기록
    kmWrap: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      width: "fit-content",
    },
    kmValue: {
      color: "#000",
      fontSize: "clamp(44px, 18vw, 64px)",
      fontWeight: 900,
      lineHeight: 1,
    },
    kmLabel: { color: "#C4C4C6", fontSize: 12 },
    statRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    stat: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      minWidth: 0,
      flex: 1,
    },
    statValue: {
      color: "#1E1E22",
      fontSize: "clamp(16px, 6vw, 22px)",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    statLabel: { color: "#C4C4C6", fontSize: 12 },

    // 이미지 섹션 (지도/사진)
    card: {
      width: "100%",
      borderRadius: 12,
      overflow: "hidden",
      background: "#f2f2f3",
      boxShadow: "0 1px 6px rgba(0,0,0,.06)",
    },
    mapBox: {
      position: "relative",
      width: "100%",
      aspectRatio: "1 / 1", // 정사각형
    },
    mapImg: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    photoBox: {
      position: "relative",
      width: "100%",
      aspectRatio: "3 / 4", // 세로 이미지 비율
    },
    photoImg: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    // 선택 박스(반응형 비율)
    selection: {
      position: "absolute",
      left: "10%",
      top: "12%",
      width: "42%",
      height: "30%",
      borderRadius: 4,
      outline: "3px #FF8C42 solid",
      outlineOffset: "-2px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.04) inset",
      pointerEvents: "none",
    },
    // 위치 정보 배지
    locPill: {
      position: "absolute",
      left: 10,
      bottom: 10,
      padding: "8px 10px",
      background: "rgba(252,252,252,.95)",
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 500,
      color: "#2A292E",
      boxShadow: "0 1px 4px rgba(0,0,0,.08)",
    },

    // 하단 버튼 고정
    bottomWrap: {
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      bottom: "calc(env(safe-area-inset-bottom) + 12px)", // iPhone 홈 인디케이터 고려
      width: "min(92vw, 360px)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      zIndex: 10,
    },
    btn: {
      height: 50,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      userSelect: "none",
    },
    primary: { background: "#FF8C42", color: "#FCFCFC", border: "none" },
    secondary: { background: "#1E1E22", color: "#FCFCFC", border: "none" },
  };

  const distanceStr = Number(distance || 0).toFixed(2);

  const handleSave = () => {
    // TODO: 캔버스로 합성 후 저장 등 구현 가능(현재는 자리표시자)
    console.log("사진 저장하기 클릭");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "러닝 결과",
          text: `거리 ${distanceStr}km · 시간 ${formatTime(
            elapsedTime
          )} · 페이스 ${formatPace(pace)}`,
        });
      } else {
        alert("이 브라우저는 공유 기능을 지원하지 않습니다.");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div style={S.screen}>
      {/* 스크롤 영역 */}
      <div style={S.contentScroll}>
        <div style={S.contentInner}>
          {/* 코스 정보/기록 */}
          <div style={S.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={S.date}>오늘 · 오전 7:40</div>
              <div style={S.title}>제주 아름다운 해안 코스</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={S.kmWrap}>
                <div style={S.kmValue}>{distanceStr}</div>
                <div style={S.kmLabel}>킬로미터</div>
              </div>

              <div style={S.statRow}>
                <div style={S.stat}>
                  <div style={S.statValue}>{formatPace(pace)}</div>
                  <div style={S.statLabel}>페이스</div>
                </div>
                <div style={S.stat}>
                  <div style={S.statValue}>{formatTime(elapsedTime)}</div>
                  <div style={S.statLabel}>시간</div>
                </div>
                <div style={S.stat}>
                  <div style={S.statValue}>{Math.round(calories)}</div>
                  <div style={S.statLabel}>칼로리</div>
                </div>
              </div>
            </div>
          </div>

          {/* 지도 미리보기 */}
          <div style={S.card}>
            <div style={S.mapBox}>
              <img
                style={S.mapImg}
                src={"https://placehold.co/600x600?text=Map"}
                alt="map"
              />
            </div>
          </div>

          {/* 사진 + 선택 박스 + 위치 배지 */}
          <div style={S.card}>
            <div style={S.photoBox}>
              <img
                style={S.photoImg}
                src={"https://placehold.co/900x1200?text=Photo"}
                alt="photo"
              />
              <div style={S.selection} />
              <div style={S.locPill}>오등동, 제주시</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 고정 */}
      <div style={S.bottomWrap}>
        <button style={{ ...S.btn, ...S.primary }} onClick={handleSave}>
          사진 저장하기
        </button>
        <button style={{ ...S.btn, ...S.secondary }} onClick={handleShare}>
          공유하기
        </button>
      </div>
    </div>
  );
}
