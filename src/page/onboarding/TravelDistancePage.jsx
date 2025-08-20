import React, { useMemo, useState } from "react";

export default function TravelDistancePage({
  defaultDistance = 10, // km (0 ~ 20)
  onBack, // optional
  onNext, // (distanceKm:number) => void
}) {
  const [km, setKm] = useState(
    typeof defaultDistance === "number" ? defaultDistance : 10
  );

  // 퍼센트(0~100)
  const pctRaw = useMemo(() => (km / 20) * 100, [km]);
  // 라벨이 트랙 밖으로 안 튀게 살짝 여유(6% ~ 94%)를 둡니다.
  const pct = Math.max(6, Math.min(94, pctRaw));

  const valueText = Number.isInteger(km) ? `${km}km` : `${km.toFixed(1)}km`;

  const handleSubmit = () => onNext && onNext(Number(km));

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
      {/* 슬라이더 썸 스타일 */}
      <style>{`
        .distance-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          outline: none;
          background: transparent;
        }
        .distance-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FF8C42;
          border: none;
          cursor: pointer;
          margin-top: -6px; /* 트랙 높이 8 기준 중앙정렬 */
        }
        .distance-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FF8C42;
          border: none;
          cursor: pointer;
        }
      `}</style>

      {/* 상단 상태바(샘플) */}
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

      {/* 뒤로가기 (통일된 보더-체브론형) */}
      <button
        onClick={
          onBack
            ? onBack
            : () => {
                if (window.history?.length > 0) window.history.back();
              }
        }
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

      {/* 타이틀/설명 */}
      <div
        style={{
          left: 18,
          top: 120,
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
          마지막 질문이에요!
        </div>
        <div
          style={{
            color: "#1E1E22",
            fontSize: 22,
            fontFamily: "Pretendard",
            fontWeight: 500,
          }}
        >
          제주에서 달리고 싶은 거리를 선택해주세요.
        </div>
      </div>

      {/* 슬라이더 영역 */}
      <div
        style={{
          width: 339,
          left: 18,
          top: 224,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* 0km / 20km 라벨 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#1E1E1E",
            fontSize: 16,
            fontFamily: "Inter",
            lineHeight: "22.4px",
          }}
        >
          <span>0km</span>
          <span>20km</span>
        </div>

        {/* 트랙 + 슬라이더 + 값 라벨 */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            width: "100%",
            height: 8,
            background: "#E6E6E6",
            borderRadius: 9999,
          }}
        >
          {/* 진행 채움 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pctRaw}%`,
              background: "#FF8C42",
              borderRadius: 9999,
              pointerEvents: "none",
            }}
          />

          {/* 🔹 선택 값 라벨 (막대 끝 위치) */}
          <div
            style={{
              position: "absolute",
              left: `${pct}%`,
              top: -34,
              transform: "translateX(-50%)",
              background: "#FFFFFF",
              border: "1px solid #FF8C42",
              color: "#FF8C42",
              fontSize: 12,
              fontFamily: "Pretendard",
              fontWeight: 700,
              lineHeight: "16px",
              padding: "2px 8px",
              borderRadius: 12,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {valueText}
            {/* 꼬리(삼각형) */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: -6,
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid #FF8C42",
              }}
            />
          </div>

          {/* 실제 슬라이더 (썸만 보이도록) */}
          <input
            className="distance-range"
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            aria-label="거리 선택 슬라이더"
            style={{
              position: "relative",
              zIndex: 1,
              background:
                "linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,0) 100%)",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* 하단 CTA (완료) */}
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
          onClick={handleSubmit}
          style={{
            width: "100%",
            height: 54,
            borderRadius: 6,
            border: "none",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#FF8C42",
            color: "#FCFCFC",
            fontSize: 16,
            fontFamily: "Pretendard",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          완료
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
