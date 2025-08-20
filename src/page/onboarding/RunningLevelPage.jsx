import React, { useEffect, useMemo, useState } from "react";

// 레벨 정의 (줄바꿈 \n 포함)
const LEVELS = [
  {
    id: "level1",
    label: "가볍게 쉬엄쉬엄\n조깅하듯이 달리는 편이에요",
    img: "/level1.png",
  },
  {
    id: "level2",
    label: "꾸준히 쉬지 않고\n페이스를 유지하며 달리는 편이에요",
    img: "/level2.png",
  },
  {
    id: "level3",
    label: "높은 경사도 문제없어요!\n러닝에 자신있는 편이에요",
    img: "/level3.png",
  },
];

// label(문구) 또는 id(level1~3) 모두 초기값으로 허용
function normalizeIndex(defaultLevel) {
  if (!defaultLevel) return 0;
  const byId = LEVELS.findIndex((l) => l.id === defaultLevel);
  if (byId >= 0) return byId;
  const byLabel = LEVELS.findIndex((l) => l.label === defaultLevel);
  return byLabel >= 0 ? byLabel : 0;
}

export default function RunningLevelPage({
  defaultLevel = null, // 'level1'|'level2'|'level3' 또는 label 문자열
  onBack, // optional
  onNext, // (label:string) => void  ← 기존과 동일
}) {
  const [idx, setIdx] = useState(() => normalizeIndex(defaultLevel));
  const level = LEVELS[idx];
  const canProceed = useMemo(() => !!level, [level]);

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(LEVELS.length - 1, i + 1));
  const submit = () => {
    if (canProceed && onNext) onNext(level.label);
  };

  // 키보드 ←/→, Enter 지원
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const handleBack = () => {
    if (typeof onBack === "function") onBack();
    else if (window.history?.length > 0) window.history.back();
  };

  return (
    <div
      style={{
        width: 375,
        height: 812,
        position: "relative",
        background: "white",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      {/* (간단) 상태바 */}
      <div
        style={{
          width: 376,
          height: 54,
          left: -1,
          top: 0,
          position: "absolute",
          background: "white",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 48.68,
            top: 18.34,
            color: "black",
            fontSize: 17,
            fontFamily: "SF Pro",
            fontWeight: 590,
            lineHeight: "22px",
          }}
        >
          9:41
        </div>
      </div>

      {/* ✅ 뒤로가기 (다른 페이지와 동일한 보더-체브론 방식) */}
      <button
        onClick={handleBack}
        aria-label="뒤로가기"
        style={{
          position: "absolute",
          left: 12,
          top: 66,
          width: 32,
          height: 32,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderLeft: "2px solid #1E1E22",
            borderBottom: "2px solid #1E1E22",
            transform: "rotate(45deg)",
          }}
        />
      </button>

      {/* 타이틀 */}
      <div
        style={{
          left: 18,
          top: 120,
          position: "absolute",
          color: "#1E1E22",
          fontSize: 30,
          fontFamily: "Pretendard",
          fontWeight: 500,
          lineHeight: "30px",
        }}
      >
        평소 러닝 강도는?
      </div>

      {/* 멘트 + 이미지 (넓은 폭 + 줄바꿈 반영) */}
      <div
        style={{
          left: 16,
          right: 16,
          top: 253,
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            maxWidth: 343,
            padding: "0 10px",
            textAlign: "center",
            color: "#1E1E22",
            fontSize: 18,
            fontFamily: "Pretendard",
            fontWeight: 500,
            lineHeight: "26px",
            whiteSpace: "pre-line", // ← \n 줄바꿈 적용
            wordBreak: "keep-all", // ← 한글 단어 깨짐 방지
          }}
        >
          {`“${level.label}”`}
        </div>

        <img
          src={level.img}
          alt={level.id}
          style={{ width: 180, height: 150, objectFit: "contain" }}
        />
      </div>

      {/* 좌/우 화살표 */}
      <button
        onClick={prev}
        disabled={idx === 0}
        aria-label="이전 레벨"
        style={{
          position: "absolute",
          left: 18,
          top: 397,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "none",
          background: "rgba(0,0,0,0.50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: idx === 0 ? "not-allowed" : "pointer",
          opacity: idx === 0 ? 0.4 : 1,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderLeft: "2px solid #FFFFFF",
            borderBottom: "2px solid #FFFFFF",
            transform: "rotate(45deg)",
          }}
        />
      </button>

      <button
        onClick={next}
        disabled={idx === LEVELS.length - 1}
        aria-label="다음 레벨"
        style={{
          position: "absolute",
          right: 18,
          top: 397,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "none",
          background: "rgba(0,0,0,0.50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: idx === LEVELS.length - 1 ? "not-allowed" : "pointer",
          opacity: idx === LEVELS.length - 1 ? 0.4 : 1,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderLeft: "2px solid #FFFFFF",
            borderBottom: "2px solid #FFFFFF",
            transform: "rotate(-135deg)",
          }}
        />
      </button>

      {/* 하단 CTA */}
      <div
        style={{
          position: "absolute",
          left: 16,
          width: 343,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          zIndex: 10,
        }}
      >
        <button
          onClick={submit}
          disabled={!canProceed}
          style={{
            width: "100%",
            height: 54,
            borderRadius: 6,
            border: "none",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            background: canProceed ? "#FF8C42" : "#E4E4E7",
            color: canProceed ? "#FCFCFC" : "#9CA3AF",
            fontSize: 16,
            fontFamily: "Pretendard",
            fontWeight: 700,
            lineHeight: "16px",
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          다음
        </button>
      </div>

      {/* 홈 인디케이터(미리보기) */}
      <div
        style={{
          width: 375,
          height: 24,
          position: "absolute",
          left: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 129,
            height: 4.5,
            left: 123,
            top: 16.8,
            position: "absolute",
            background: "black",
            borderRadius: 90,
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
}
