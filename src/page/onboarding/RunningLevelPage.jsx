import React, { useMemo, useState } from "react";

const LEVEL_OPTIONS = [
  "가볍게 조깅하듯이 달리고 싶어요",
  "꾸준히 계속 달리고 싶어요",
  "높은 경사도 문제 없어요",
];

export default function RunningLevelPage({
  defaultLevel = null, // 위 옵션 문자열 중 하나
  progressPercent = 60, // 상단 진행바 %
  onBack, // optional
  onNext, // (level) => void
}) {
  const [level, setLevel] = useState(defaultLevel);
  const canProceed = useMemo(() => !!level, [level]);

  return (
    <div
      style={{
        width: 360,
        height: 800,
        position: "relative",
        background: "white",
        overflow: "hidden",
      }}
    >
      {/* 진행 바 */}
      <div
        style={{
          width: 273,
          paddingTop: 10,
          paddingBottom: 10,
          left: 43,
          top: 68,
          position: "absolute",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: 273, height: 44, position: "relative" }}>
          <div
            style={{
              width: 241,
              height: 4,
              left: 16,
              top: 20,
              position: "absolute",
              background: "#F0F0F2",
            }}
          >
            <div
              style={{
                width: Math.max(
                  0,
                  Math.min(241, (241 * progressPercent) / 100)
                ),
                height: 4,
                background: "#1E1E22",
                borderRadius: 100,
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: 24,
            height: 24,
            background: "#1E1E22",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            width: 24,
            height: 24,
            background: "#F0F0F2",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* 타이틀 */}
      <div
        style={{
          width: 360,
          padding: 10,
          left: 0,
          top: 146,
          position: "absolute",
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "black",
            fontSize: 24,
            fontFamily: "Pretendard",
            fontWeight: 700,
          }}
        >
          러너님의 러닝 수준은?
        </div>
      </div>

      {/* 옵션 리스트 */}
      <div
        style={{
          width: 328,
          left: 16,
          top: 243,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {LEVEL_OPTIONS.map((opt) => {
          const active = level === opt;
          return (
            <button
              key={opt}
              onClick={() => setLevel(opt)}
              aria-pressed={active}
              style={{
                width: 328,
                height: 50,
                padding: 10,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: active ? "#1E1E22" : "#C4C4C6",
                color: active ? "#FCFCFC" : "#626264",
                fontSize: 22,
                fontFamily: "Pretendard",
                fontWeight: 600,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* 뒤로 버튼 (옵션) */}
      {onBack && (
        <button
          onClick={onBack}
          title="뒤로"
          style={{
            width: 50,
            height: 50,
            left: 16,
            top: 710,
            position: "absolute",
            borderRadius: 8,
            border: "1px solid #1E1E22",
            background: "white",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              margin: "auto",
              borderLeft: "2px solid #1E1E22",
              borderBottom: "2px solid #1E1E22",
              transform: "rotate(135deg)",
            }}
          />
        </button>
      )}

      {/* 다음 버튼 */}
      <button
        onClick={() => canProceed && onNext && onNext(level)}
        disabled={!canProceed}
        title="다음"
        style={{
          width: 50,
          height: 50,
          left: 294,
          top: 710,
          position: "absolute",
          borderRadius: 8,
          border: "none",
          background: canProceed ? "#1E1E22" : "#C4C4C6",
          cursor: canProceed ? "pointer" : "not-allowed",
        }}
      >
        <div
          style={{
            width: 10,
            height: 20,
            margin: "auto",
            borderLeft: `2px solid ${canProceed ? "#FCFCFC" : "#626264"}`,
            borderBottom: `2px solid ${canProceed ? "#FCFCFC" : "#626264"}`,
            transform: "rotate(-45deg)",
          }}
        />
      </button>
    </div>
  );
}
