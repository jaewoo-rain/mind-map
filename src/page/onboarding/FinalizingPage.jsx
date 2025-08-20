import React, { useEffect } from "react";

/**
 * 추천코스 생성 로딩 화면
 * - 2초 회전 후 recommendPath로 이동
 * - API 호출은 아래 useEffect 내부 주석 위치에 추가하면 됨
 */
export default function FinalizingPage({
  recommendPath = "/recommend",
  durationMs = 2000,
  // 필요 시 전달할 데이터가 있다면 props로 넘겨서 fetch body에 사용하세요.
  // profile,
  // saveUrl = "/api/onboarding/complete",
  // onComplete,
}) {
  useEffect(() => {
    let cancelled = false;

    // ⬇️ API 호출 자리 (예시) — 주석 해제 후 사용
    // const api = (async () => {
    //   try {
    //     const res = await fetch(saveUrl, {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ profile }),
    //     });
    //     const data = await res.json().catch(() => null);
    //     if (!cancelled && onComplete) onComplete(data);
    //   } catch (e) {
    //     console.warn("finalizing error:", e);
    //   }
    // })();

    const delay = new Promise((r) => setTimeout(r, durationMs));

    // 지금은 API가 없으니 delay만 기다렸다가 이동
    Promise.allSettled([delay /*, api*/]).then(() => {
      if (!cancelled) window.location.href = recommendPath;
    });

    return () => {
      cancelled = true;
    };
  }, [durationMs, recommendPath /*, saveUrl, profile, onComplete*/]);

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
      {/* 간단 상태바(미리보기용) */}
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

      {/* 타이틀/서브타이틀 */}
      <div
        style={{
          width: 323,
          left: 18,
          top: 183,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#1E1E22",
            fontSize: 30,
            fontFamily: "Pretendard",
            fontWeight: 500,
            lineHeight: "34.5px",
          }}
        >
          추천코스를 생성중입니다!
        </div>
        <div
          style={{
            textAlign: "center",
            color: "#1E1E22",
            fontSize: 22,
            fontFamily: "Pretendard",
            fontWeight: 500,
          }}
        >
          잠시만 기다려주세요.
        </div>
      </div>

      {/* 회전 스피너 */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          width: 150,
          height: 150,
          left: 105,
          top: 325,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 바탕 도넛 */}
        <div
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: "12px solid #C4C4C6",
            opacity: 1,
          }}
        />
        {/* 주황 아크(상단 한쪽만 주황) + 회전 */}
        <div
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: "12px solid transparent",
            borderTopColor: "#FF8C42",
            animation: "spin 1.1s linear infinite",
          }}
        />
      </div>

      {/* 하단 홈 인디케이터(미리보기) */}
      <div
        style={{
          width: 360,
          height: 24,
          left: 0,
          bottom: 0,
          position: "absolute",
        }}
      >
        <div
          style={{
            width: 128.96,
            height: 4.48,
            left: 116,
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
