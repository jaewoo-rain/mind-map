// src/TravelReasonPage.jsx
import React, { useMemo, useState, useEffect } from "react";

const REASON_CHIPS = [
  "😌 힐링",
  "💪 운동과 건강",
  "📷 SNS 업로드",
  "📖 교육적 목적",
  "👀 새로운 경험",
  "😎 신혼여행 및 특별한 목적",
  "🫶🏻 자아성찰",
];

export default function TravelReasonPage({
  defaultReason = null, // 선택값 유지용(옵션)
  onBack,
  onNext,
}) {
  const [reason, setReason] = useState(defaultReason);
  const canProceed = useMemo(() => !!reason, [reason]);

  // Enter로 진행
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && canProceed) submit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canProceed, reason]);

  const submit = () => {
    if (!canProceed) return;
    onNext && onNext(reason);
  };

  const handleBack = () => {
    if (typeof onBack === "function") onBack();
    else if (window.history?.length > 0) window.history.back();
  };

  const chipStyle = (selected) => ({
    height: 40,
    padding: "8px 16px",
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: selected ? "#FFF4EC" : "#FCFCFC",
    outline: selected ? "1px var(--main, #FF8C42) solid" : "none",
    outlineOffset: -1,
    border: "none",
    cursor: "pointer",
    transition: "background 120ms ease, outline-color 120ms ease",
  });

  const chipTextStyle = (selected) => ({
    color: selected ? "#1E1E22" : "#C4C4C6",
    fontSize: 14,
    fontFamily: "Pretendard",
    fontWeight: 400,
    lineHeight: "19.6px",
    whiteSpace: "nowrap",
  });

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
      {/* 상단 상태바(간단) */}
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

      {/* 뒤로가기 */}
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
        제주에 여행 오신 이유는?
      </div>

      {/* 칩 리스트 */}
      <div
        role="radiogroup"
        aria-label="여행 이유 선택"
        style={{
          left: 18,
          top: 178,
          position: "absolute",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 14, // 가로 간격
          rowGap: 20, // 세로 간격
          width: 343,
        }}
      >
        {REASON_CHIPS.map((label) => {
          const selected = reason === label;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setReason(label)}
              style={chipStyle(selected)}
            >
              <span style={chipTextStyle(selected)}>{label}</span>
            </button>
          );
        })}
      </div>

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
