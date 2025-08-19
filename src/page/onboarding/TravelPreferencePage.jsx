import React, { useMemo, useState } from "react";

export default function TravelPreferencePage({
  defaultPreference = null, // 'nature' | 'city'
  onBack,
  onNext,
}) {
  const [pref, setPref] = useState(defaultPreference);
  const canProceed = useMemo(() => !!pref, [pref]);

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
      {/* 진행 표시 (30%) */}
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
                width: 76.11,
                height: 4,
                left: 0,
                top: 0,
                position: "absolute",
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
            borderRadius: 9999,
          }}
        />
        <div
          style={{
            width: 24,
            height: 24,
            background: "#F0F0F2",
            borderRadius: 9999,
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
          러너님의 여행 취향은?
        </div>
      </div>

      {/* 옵션 카드 */}
      <div
        style={{
          left: 37,
          top: 243,
          position: "absolute",
          display: "inline-flex",
          alignItems: "center",
          gap: 30,
        }}
      >
        {/* 자연 선호 */}
        <button
          onClick={() => setPref("nature")}
          aria-pressed={pref === "nature"}
          style={{
            width: 128,
            height: 128,
            position: "relative",
            background: pref === "nature" ? "#1E1E22" : "#C4C4C6",
            color: pref === "nature" ? "#FCFCFC" : "#626264",
            overflow: "hidden",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 51,
              fontSize: 22,
              fontFamily: "Pretendard",
              fontWeight: 600,
            }}
          >
            자연 선호
          </div>
        </button>

        {/* 도시 선호 */}
        <button
          onClick={() => setPref("city")}
          aria-pressed={pref === "city"}
          style={{
            width: 128,
            height: 128,
            position: "relative",
            background: pref === "city" ? "#1E1E22" : "#C4C4C6",
            color: pref === "city" ? "#FCFCFC" : "#626264",
            overflow: "hidden",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 51,
              fontSize: 22,
              fontFamily: "Pretendard",
              fontWeight: 600,
            }}
          >
            도시 선호
          </div>
        </button>
      </div>

      {/* 뒤로/다음 버튼 */}
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

      <button
        onClick={() => canProceed && onNext && onNext(pref)}
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
            width: 24,
            height: 24,
            margin: "auto",
            borderLeft: "2px solid #FCFCFC",
            borderBottom: "2px solid #FCFCFC",
            transform: "rotate(-45deg)",
          }}
        />
      </button>
    </div>
  );
}
