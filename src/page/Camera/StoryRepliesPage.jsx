import React, { useEffect, useMemo, useRef, useState } from "react";

export default function StoryRepliesPage({
  locationName = "함덕해수욕장",
  myStory,
  others = [],
}) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [reply, setReply] = useState("");
  const [sentToastFor, setSentToastFor] = useState(null);

  // 카드/레이아웃 동적 계산
  const [cardW, setCardW] = useState(297);
  const [cardH, setCardH] = useState(528);
  const [gap, setGap] = useState(16);
  const [sidePad, setSidePad] = useState(32);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.clientWidth || window.innerWidth || 360;
      const h = el.clientHeight || 528;

      // 컨테이너 높이에 맞춘 16:9 카드
      const targetH = h; // 전체 높이 채우기
      const targetW = Math.min(Math.round((targetH * 9) / 16), w - 32);
      const pad = Math.max((w - targetW) / 2, 16);

      setCardH(targetH);
      setCardW(targetW);
      setGap(16);
      setSidePad(pad);

      el.style.scrollPaddingLeft = `${pad}px`;
      el.style.scrollPaddingRight = `${pad}px`;
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    window.addEventListener("orientationchange", calc);
    window.addEventListener("resize", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", calc);
      window.removeEventListener("resize", calc);
    };
  }, []);

  const stories = useMemo(() => {
    const arr = [];
    if (myStory) arr.push({ id: "me", ...myStory });
    if (Array.isArray(others)) arr.push(...others);
    return arr;
  }, [myStory, others]);

  // 가운데 카드 active 계산
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let idx = 0;
        let best = Infinity;
        for (let i = 0; i < stories.length; i++) {
          const left = sidePad + i * (cardW + gap) + cardW / 2;
          const dist = Math.abs(center - left);
          if (dist < best) {
            best = dist;
            idx = i;
          }
        }
        setActive(idx);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [stories.length, sidePad, cardW, gap]);

  const handleSend = () => {
    if (!reply.trim() || !stories.length) return;
    const current = stories[active];
    // TODO: 실제 답장 API
    setSentToastFor(current.id ?? active);
    setReply("");
    setTimeout(() => setSentToastFor(null), 1500);
  };

  // ---------- 스타일 (반응형) ----------
  const root = {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    background: "black",
    overflow: "hidden",
  };
  const statusBar = {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: 44,
    background: "black",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: "12px 18px",
    boxSizing: "border-box",
    fontWeight: 600,
    zIndex: 5,
  };
  const header = {
    position: "absolute",
    top: 74,
    left: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    zIndex: 2,
  };
  const pinIcon = (
    <div style={{ width: 20, height: 24, position: "relative" }}>
      <div
        style={{
          width: 20,
          height: 24,
          position: "absolute",
          background: "#FF8C42",
          borderRadius: 4,
        }}
      />
      <div
        style={{
          width: 6.5,
          height: 6.5,
          position: "absolute",
          left: 7,
          top: 6.5,
          background: "white",
          borderRadius: 999,
        }}
      />
    </div>
  );
  const homeIndicator = {
    position: "absolute",
    bottom: 8,
    left: "50%",
    transform: "translateX(-50%)",
    width: 129,
    height: 4.5,
    background: "white",
    borderRadius: 90,
  };

  return (
    <div style={root}>
      <div style={statusBar}>
        <div style={{ fontSize: 15, lineHeight: "20px" }}>9:41</div>
      </div>

      <div style={header}>
        {pinIcon}
        <div style={{ color: "white", fontSize: 24, fontWeight: 700 }}>
          {locationName}
        </div>
      </div>

      {/* 카드 가로 스크롤: 상단/하단 고정 영역 사이를 꽉 채움 */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 123,
          bottom: 150, // 하단 입력 영역 높이 확보
          display: "flex",
          gap,
          padding: `0 ${sidePad}px`,
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
        }}
      >
        {stories.map((s, i) => (
          <StoryCard
            key={s.id || i}
            data={s}
            width={cardW}
            height={cardH}
            active={i === active}
            showToast={sentToastFor === (s.id || i)}
          />
        ))}
      </div>

      {/* 하단 입력 */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 58,
          display: "flex",
          alignItems: "flex-end",
          gap: 7,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            background: "#D9D9D9",
            borderRadius: 9999,
            flex: "0 0 auto",
          }}
        />
        <div
          style={{
            flex: 1,
            height: 42,
            position: "relative",
            background: "black",
            borderRadius: 43,
            outline: "1px #C4C4C6 solid",
            outlineOffset: "-1px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            paddingRight: 12,
            gap: 8,
          }}
        >
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              stories.length
                ? "이 스토리에 답글을 다세요..."
                : "볼 스토리가 없어요"
            }
            disabled={!stories.length}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#C4C4C6",
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!stories.length}
            style={{
              border: "none",
              background: "transparent",
              color: reply.trim() && stories.length ? "#FF8C42" : "#5a5a5a",
              fontSize: 13,
              fontWeight: 700,
              cursor: stories.length ? "pointer" : "default",
            }}
          >
            보내기
          </button>
        </div>
      </div>

      <div style={homeIndicator} />
    </div>
  );
}

function StoryCard({ data, width, height, active, showToast }) {
  return (
    <div
      style={{
        flex: "0 0 auto",
        width,
        height,
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        backgroundImage: `url(${data.photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        scrollSnapAlign: "center",
        transition: "opacity .25s",
        opacity: active ? 1 : 0.4,
      }}
    >
      {/* 상단 프로필/시간 */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 22,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={data.avatar}
            alt=""
            style={{ width: 30, height: 30, borderRadius: 9999 }}
          />
          <div
            style={{
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              textShadow: "0 1px 2px rgba(0,0,0,.4)",
            }}
          >
            {data.author}
          </div>
        </div>
        <div
          style={{
            color: "white",
            fontSize: 12,
            fontWeight: 500,
            textShadow: "0 1px 2px rgba(0,0,0,.4)",
          }}
        >
          {data.timeAgo}
        </div>
      </div>

      {/* 하단 캡션 */}
      {data.caption && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 44,
            padding: "10px 14px",
            background: "rgba(255,255,255,0.30)",
            borderRadius: 20,
            backdropFilter: "blur(2px)",
            color: "black",
            fontSize: 15,
            fontWeight: 700,
            whiteSpace: "nowrap",
            maxWidth: width - 40,
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
          title={data.caption}
        >
          {data.caption}
        </div>
      )}

      {/* 전송 토스트 */}
      {showToast && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            padding: "10px 14px",
            background: "rgba(255,255,255,0.85)",
            borderRadius: 12,
            color: "#111",
            fontSize: 14,
            fontWeight: 700,
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          답장이 전송됨
        </div>
      )}
    </div>
  );
}
