// src/TravelReasonPage.jsx
import React, { useMemo, useState } from "react";

const REASONS = [
  "일상을 벗어나 힐링",
  "운동과 건강을 위해",
  "SNS에 사진 업로드",
  "신혼여행 등 특별한 목적",
  "아직 정하지 않았어요",
];

export default function TravelReasonPage({ onBack, onNext }) {
  const [reason, setReason] = useState(null);
  const canProceed = useMemo(() => !!reason, [reason]);

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
      {/* 진행 바 (90%) */}
      <div
        style={{
          width: 273,
          height: 44,
          paddingTop: 10,
          paddingBottom: 10,
          left: 43.5,
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
                width: 208.96,
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

      {/* 타이틀 + 리스트 */}
      <div
        style={{
          width: 360,
          left: 0,
          top: 146,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
        }}
      >
        <div
          style={{
            alignSelf: "stretch",
            padding: 10,
            display: "inline-flex",
            justifyContent: "center",
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
            제주도에 여행 오신 이유는?
          </div>
        </div>

        <div
          style={{
            width: 328,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {REASONS.map((r) => {
            const active = reason === r;
            return (
              <button
                key={r}
                onClick={() => setReason(r)}
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
                {r}
              </button>
            );
          })}
        </div>
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
        onClick={() => canProceed && onNext && onNext(reason)}
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
            borderLeft: `2px solid ${canProceed ? "#FCFCFC" : "#626264"}`,
            borderBottom: `2px solid ${canProceed ? "#FCFCFC" : "#626264"}`,
            transform: "rotate(-45deg)",
          }}
        />
      </button>
    </div>
  );
}
