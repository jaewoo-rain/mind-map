import React, { useEffect, useRef, useState } from "react";

export default function InputInfoPage({
  defaultNickname = "",
  onNext,
  onBack, // 선택: 부모에서 넘기면 사용, 없으면 window.history.back()
}) {
  const [nickname, setNickname] = useState(defaultNickname);
  const [kbOffset, setKbOffset] = useState(0); // 키보드 보정 px
  const canProceed = nickname.trim().length > 0;

  // Enter로 진행
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && canProceed) submit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canProceed, nickname]);

  // visualViewport로 키보드 높이 감지
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKbOffset(offset);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  const submit = () => {
    if (!canProceed || !onNext) return;
    onNext(nickname.trim());
  };

  const handleBack = () => {
    if (typeof onBack === "function") onBack();
    else if (window.history && window.history.length > 0) window.history.back();
  };

  return (
    <div
      style={{
        width: 360,
        height: 800,
        position: "relative",
        background: "white",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      {/* 상태바(간단) */}
      <div
        style={{
          width: 360,
          height: 44,
          left: 0,
          top: 0,
          position: "absolute",
          background: "white",
        }}
      >
        <div
          style={{
            left: 18,
            top: 12,
            position: "absolute",
            color: "#111",
            fontSize: 15,
            fontFamily: "Pretendard",
            fontWeight: 600,
            lineHeight: "20px",
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
          top: 54,
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {/* 심플 백 아이콘 */}
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

      {/* 헤드라인 */}
      <div
        style={{
          width: 268,
          left: 18,
          top: 108,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            color: "#1E1E22",
            fontSize: 30,
            fontFamily: "Pretendard",
            fontWeight: 500,
            lineHeight: "34.5px",
          }}
        >
          반가워요 러너님,
        </div>
        <div
          style={{
            color: "#1E1E22",
            fontSize: 22,
            fontFamily: "Pretendard",
            fontWeight: 500,
          }}
        >
          앱에서 활동하실 닉네임을 정해주세요.
        </div>
      </div>

      {/* 인풋 */}
      <div
        style={{
          width: 324,
          left: 18,
          top: 220,
          position: "absolute",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          display: "inline-flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 56,
            borderRadius: 4,
            outline: "3px #1E1E22 solid",
            outlineOffset: -3,
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            paddingRight: 4,
            gap: 4,
          }}
        >
          <input
            type="text"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            style={{
              flex: 1,
              height: 48,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 16,
              fontFamily: "Pretendard",
              color: "#1E1E22",
            }}
          />

          {/* X(지우기) — 텍스트 있을 때만 */}
          {nickname && (
            <button
              onClick={() => setNickname("")}
              aria-label="입력 지우기"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#F4F4F5",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                outline: "none",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  color: "#1E1E22",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ×
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 홈 인디케이터(미리보기) */}
      <div
        style={{
          width: 360,
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
            left: 115.04,
            top: 16.84,
            position: "absolute",
            background: "black",
            borderRadius: 90,
            opacity: 0.9,
          }}
        />
      </div>

      {/* 다음 버튼 — 하단 고정 + 키보드 열리면 올라감 */}
      <div
        style={{
          position: "absolute",
          left: 8,
          width: 343,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          transform: `translateY(-${kbOffset}px)`,
          transition: "transform 180ms ease",
          zIndex: 10,
        }}
      >
        <button
          onClick={submit}
          disabled={!canProceed}
          style={{
            width: "100%",
            height: 54,
            background: canProceed ? "var(--main, #FF8C42)" : "#E4E4E7",
            borderRadius: 6,
            border: "none",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: canProceed ? "pointer" : "not-allowed",
            outline: "none",
          }}
        >
          <div
            style={{
              color: canProceed ? "#FCFCFC" : "#9CA3AF",
              fontSize: 16,
              fontFamily: "Pretendard",
              fontWeight: 700,
              lineHeight: "16px",
            }}
          >
            다음
          </div>
        </button>
      </div>
    </div>
  );
}
