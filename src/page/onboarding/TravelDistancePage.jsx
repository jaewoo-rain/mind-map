import React, { useMemo, useState } from "react";

const DISTANCE_OPTIONS = ["5km 미만", "5~10km", "10km 이상"];

export default function TravelDistancePage({
  defaultDistance = null, // "5km 미만" | "5~10km" | "10km 이상"
  progressPercent = 30, // 상단 진행바 % (디자인에 맞춰 조절)
  onBack, // optional
  onNext, // (distance) => void
}) {
  const [distance, setDistance] = useState(defaultDistance);
  const canProceed = useMemo(() => !!distance, [distance]);

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
          height: 44,
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
          제주에서 얼마나 뛸까요?
        </div>
      </div>

      {/* 거리 옵션 */}
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
        {DISTANCE_OPTIONS.map((opt) => {
          const active = distance === opt;
          return (
            <button
              key={opt}
              onClick={() => setDistance(opt)}
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

      {/* 뒤로 버튼 (선택) */}
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
        onClick={() => canProceed && onNext && onNext(distance)}
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
