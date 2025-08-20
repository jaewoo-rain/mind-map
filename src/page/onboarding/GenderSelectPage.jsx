import React, { useEffect, useMemo, useState } from "react";

export default function GenderSelectPage({
  defaultGender = null, // 'male' | 'female'
  defaultAgeGroup = null, // 유지 전달용
  onBack,
  onNext,
}) {
  const [gender, setGender] = useState(defaultGender);
  const canProceed = useMemo(() => !!gender, [gender]);

  // Enter로 진행
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && canProceed) submit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canProceed]);

  const submit = () => {
    if (!canProceed) return;
    onNext && onNext(gender, defaultAgeGroup ?? null);
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
    border: "none",
    cursor: "pointer",
    background: selected ? "#FFF4EC" : "#FFFFFF",
    outline: selected ? "1px var(--main, #FF8C42) solid" : "1px #C4C4C6 solid",
    outlineOffset: -1,
    transition: "background 120ms ease, outline-color 120ms ease",
  });

  const optionTextStyle = (selected) => ({
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
      {/* 상단 상태바 (간략) */}
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
        러너님의 성별은?
      </div>

      {/* 성별 옵션 */}
      <div
        role="radiogroup"
        aria-label="성별 선택"
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
        {/* 남자 */}
        <button
          type="button"
          role="radio"
          aria-checked={gender === "male"}
          onClick={() => setGender("male")}
          style={optionStyle(gender === "male")}
        >
          <span style={optionTextStyle(gender === "male")}>남자</span>
        </button>

        {/* 여자 */}
        <button
          type="button"
          role="radio"
          aria-checked={gender === "female"}
          onClick={() => setGender("female")}
          style={optionStyle(gender === "female")}
        >
          <span style={optionTextStyle(gender === "female")}>여자</span>
        </button>
      </div>

      {/* 하단 CTA 버튼 */}
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
          type="button"
          disabled={!canProceed}
          onClick={submit}
          style={{
            width: "100%",
            height: 54,
            background: canProceed ? "#FF8C42" : "#E4E4E7",
            borderRadius: 6,
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
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
            width: 128.96,
            height: 4.48,
            left: 123,
            top: 16.84,
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
