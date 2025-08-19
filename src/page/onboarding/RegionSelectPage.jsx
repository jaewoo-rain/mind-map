import React, { useState } from "react";

export default function RegionSelectPage({ onBack, onNext }) {
  const [region, setRegion] = useState(null);

  const handleNext = () => {
    if (region && onNext) onNext(region);
  };

  return (
    <div
      style={{
        width: 360,
        height: 838,
        position: "relative",
        background: "white",
        overflow: "hidden",
      }}
    >
      {/* 진행 바 (60%) */}
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
                width: 142.86,
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
          런트립을 하실 지역은?
        </div>
      </div>

      {/* 제주 지도 (jeju.png) */}
      <div
        style={{
          width: 360,
          height: 218,
          left: 0,
          top: 211,
          position: "absolute",
          overflow: "hidden",
        }}
      >
        <img
          src="/jeju.png"
          alt="제주 지도"
          style={{
            width: "280px",
            height: "167px",
            left: "40px",
            top: "22px",
            position: "absolute",
            objectFit: "cover",
            border: "1px solid #5D9C55",
          }}
        />
      </div>

      {/* 지역 버튼 */}
      <div
        style={{
          width: 328,
          left: 16,
          top: 453,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {["동부", "서부", "남부", "북부"].map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            style={{
              width: 328,
              height: 50,
              padding: 10,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              background: region === r ? "#1E1E22" : "#C4C4C6",
              color: region === r ? "#FCFCFC" : "#626264",
              fontSize: 22,
              fontFamily: "Pretendard",
              fontWeight: 600,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 뒤로/다음 */}
      {onBack && (
        <button
          onClick={onBack}
          title="뒤로"
          style={{
            width: 50,
            height: 50,
            left: 16,
            top: 748,
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
        onClick={handleNext}
        disabled={!region}
        title="다음"
        style={{
          width: 50,
          height: 50,
          left: 294,
          top: 748,
          position: "absolute",
          borderRadius: 8,
          border: "none",
          background: region ? "#1E1E22" : "#C4C4C6",
          cursor: region ? "pointer" : "not-allowed",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            margin: "auto",
            borderLeft: `2px solid ${region ? "#FCFCFC" : "#626264"}`,
            borderBottom: `2px solid ${region ? "#FCFCFC" : "#626264"}`,
            transform: "rotate(-45deg)",
          }}
        />
      </button>
    </div>
  );
}
