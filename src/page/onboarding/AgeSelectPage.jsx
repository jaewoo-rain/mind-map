import React, { useEffect, useMemo, useState } from "react";

const AGE_OPTIONS = ["10대", "20대", "30대", "40대", "50대 이상"];

/**
 * 디자인 스펙
 * - 리스트형 옵션(선택됨: #FFF4EC 배경 + #FF8C42 테두리, 텍스트 #2A292E)
 * - 비선택: 흰색 배경 + #C4C4C6 테두리/텍스트
 * - 상단 뒤로가기, 하단 풀폭 "다음" 버튼
 *
 * props:
 *  - defaultAgeGroup?: string | null
 *  - onBack?: () => void
 *  - onNext: (ageGroup: string) => void
 */
export default function AgeSelectPage({
  defaultAgeGroup = null,
  onBack,
  onNext,
}) {
  const [age, setAge] = useState(defaultAgeGroup);
  const canProceed = useMemo(() => !!age, [age]);

  // Enter 키로 진행
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && canProceed) submit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canProceed, age]);

  const submit = () => {
    if (!canProceed) return;
    onNext && onNext(age);
  };

  const handleBack = () => {
    if (typeof onBack === "function") onBack();
    else if (window.history?.length > 0) window.history.back();
  };

  const optionStyle = (selected) => ({
    width: "100%",
    height: 60,
    padding: "14px 16px",
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    background: selected ? "#FFF4EC" : "#FFFFFF",
    outline: selected ? "1px var(--main, #FF8C42) solid" : "1px #C4C4C6 solid",
    outlineOffset: -1,
    border: "none",
    cursor: "pointer",
    transition: "background 120ms ease, outline-color 120ms ease",
  });

  const textStyle = (selected) => ({
    width: 311,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: selected ? "#2A292E" : "#C4C4C6",
    fontSize: 16,
    fontFamily: "Pretendard",
    fontWeight: 500,
    lineHeight: "16px",
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
      {/* 상태바(간단) */}
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
          top: 118,
          position: "absolute",
          color: "#1E1E22",
          fontSize: 30,
          fontFamily: "Pretendard",
          fontWeight: 500,
          lineHeight: "34.5px",
        }}
      >
        러너님의 나이는?
      </div>

      {/* 옵션 리스트 */}
      <div
        role="radiogroup"
        aria-label="나이 선택"
        style={{
          width: 343,
          left: 18,
          top: 180,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        {AGE_OPTIONS.map((label) => {
          const selected = age === label;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setAge(label)}
              style={optionStyle(selected)}
            >
              <div style={textStyle(selected)}>{label}</div>
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
