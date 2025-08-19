import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * 온보딩 마지막 로딩 페이지 (conic-gradient 도넛 프로그레스바)
 * - 1~2초 사이(기본 랜덤) 동안 진행률 애니메이션
 * - 동시에 서버로 프로필 저장/조회
 * - 둘 다 끝나면 /recommend 로 이동
 */
export default function FinalizingPage({
  nickname = "러너님",
  profile = {},
  durationMs = null, // null이면 1000~2000ms 랜덤
  saveUrl = "/api/onboarding/complete",
  recommendPath = "/recommend",
  onComplete, // (data) => void
}) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef(null);
  const doneAnimRef = useRef(false);
  const doneServerRef = useRef(false);
  const rafRef = useRef(null);

  const DURATION = useMemo(
    () =>
      typeof durationMs === "number"
        ? durationMs
        : Math.floor(1000 + Math.random() * 1000),
    [durationMs]
  );

  // 진행률 애니메이션
  useEffect(() => {
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);

      if (pct >= 100) {
        doneAnimRef.current = true;
        maybeFinish();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DURATION]);

  // 서버 통신 (저장/조회)
  useEffect(() => {
    let cancelled = false;

    const saveAndFetch = async () => {
      try {
        // const res = await fetch(saveUrl, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ profile }),
        // });
        // const data = await res.json().catch(() => null);
        // if (!cancelled && onComplete) onComplete(data);
      } catch (e) {
        console.warn("onboarding finalize error:", e);
      } finally {
        if (!cancelled) {
          doneServerRef.current = true;
          maybeFinish();
        }
      }
    };

    saveAndFetch();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveUrl, JSON.stringify(profile)]);

  // 애니메이션 + 서버 모두 끝나면 이동
  const maybeFinish = () => {
    if (doneAnimRef.current && doneServerRef.current) {
      window.location.href = recommendPath;
    }
  };

  // 도넛 프로그레스바 사이즈/두께
  const size = 150;
  const stroke = 12; // 도넛 두께
  const angle = (progress / 100) * 360;

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
      {/* 제목 */}
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
          {nickname}에게 딱 좋은 코스를 생각중
        </div>
      </div>

      {/* 도넛 프로그레스바 (conic-gradient) */}
      <div
        style={{
          width: size,
          height: size,
          left: 105,
          top: 243,
          position: "absolute",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            // 진행색(#1E1E22) -> 나머지 트랙(#E5E7EB)
            background: `conic-gradient(#1E1E22 ${angle}deg, #E5E7EB ${angle}deg)`,
            transition: "background 60ms linear",
            willChange: "background",
            // 살짝 입체감
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.06), inset 0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          {/* 안쪽 비워서 도넛 형태 만들기 */}
          <div
            style={{
              position: "absolute",
              inset: stroke,
              background: "white",
              borderRadius: "50%",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)",
            }}
          />
          {/* 가운데 퍼센트 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Pretendard",
              fontWeight: 700,
              fontSize: 18,
              color: "#1E1E22",
            }}
          >
            {Math.round(progress)}%
          </div>
          {/* 은은한 하이라이트(시각적 포인트) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(255,255,255,0.35), transparent 70%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* 하단 임티 영역(플레이스홀더) */}
      <div
        style={{
          width: 360,
          height: 126,
          left: 0,
          top: 441,
          position: "absolute",
          background: "#F3F4F6",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          left: 68,
          top: 482,
          position: "absolute",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "black",
          fontSize: 16,
          fontFamily: "Pretendard",
          fontWeight: 400,
        }}
      >
        임티 나열
        <br />
        <br />
        임티 캐릭터 - 귤, 돌하르방, 바람?
      </div>
    </div>
  );
}
