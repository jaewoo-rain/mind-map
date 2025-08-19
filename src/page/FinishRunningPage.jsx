// src/RunningCoursePage.jsx
import React from "react";

export default function FinishRunningPage() {
  return (
    <div
      style={{
        width: 360,
        height: 800,
        position: "relative",
        background: "white",
        overflow: "hidden",
        margin: "20px auto",
      }}
    >
      {/* 본문 */}
      <div
        style={{
          width: 328,
          left: 16,
          top: 62,
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {/* 코스 정보 */}
        <div
          style={{
            width: 252,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "#C4C4C6", fontSize: 12, fontWeight: 500 }}>
              오늘 - 오전 7 : 40
            </div>
            <div style={{ color: "black", fontSize: 22, fontWeight: 600 }}>
              제주 아름다운 해안 코스
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 19 }}>
            <div
              style={{
                width: 132,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ color: "black", fontSize: 64, fontWeight: 900 }}>
                3.57
              </div>
              <div style={{ color: "#C4C4C6", fontSize: 12 }}>킬로미터</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 54 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{ color: "#1E1E22", fontSize: 22, fontWeight: 600 }}
                >
                  9’01’’
                </div>
                <div style={{ color: "#C4C4C6", fontSize: 12 }}>페이스</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{ color: "#1E1E22", fontSize: 22, fontWeight: 600 }}
                >
                  31:16
                </div>
                <div style={{ color: "#C4C4C6", fontSize: 12 }}>시간</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{ color: "#1E1E22", fontSize: 22, fontWeight: 600 }}
                >
                  186
                </div>
                <div style={{ color: "#C4C4C6", fontSize: 12 }}>칼로리</div>
              </div>
            </div>
          </div>
        </div>

        {/* 지도 & 이미지 */}
        <img
          style={{ width: 328, height: 328 }}
          src="https://placehold.co/328x328"
          alt="map"
        />
        <img
          style={{ width: 576, height: 822 }}
          src="https://placehold.co/576x822"
          alt="photo"
        />

        {/* 선택된 영역 */}
        <div
          style={{
            width: 136.56,
            height: 173.28,
            borderRadius: 3.84,
            outline: "5px #FF8C42 solid",
            outlineOffset: "-2.5px",
          }}
        />

        {/* 위치 정보 */}
        <div
          style={{
            padding: 10,
            background: "#FCFCFC",
            borderRadius: 8,
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, color: "#2A292E" }}>
            오등동, 제주시
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div
        style={{
          width: 328,
          height: 50,
          padding: 10,
          left: 16,
          top: 652,
          position: "absolute",
          background: "#FF8C42",
          borderRadius: 5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#FCFCFC", fontSize: 15, fontWeight: 700 }}>
          사진 저장하기
        </div>
      </div>
      <div
        style={{
          width: 328,
          height: 50,
          padding: 10,
          left: 16,
          top: 714,
          position: "absolute",
          background: "#1E1E22",
          borderRadius: 5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#FCFCFC", fontSize: 15, fontWeight: 700 }}>
          공유하기
        </div>
      </div>
    </div>
  );
}
