import React, { useEffect, useRef, useState } from "react";

export default function CameraCaptureMobile() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 카메라/사진 상태
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [error, setError] = useState("");

  // UI 단계: camera(찍기 전) → preview(찍은 후) → typing(입력 중) → typed(입력 완료) → sent(전송 완료)
  const [step, setStep] = useState("camera");
  const [message, setMessage] = useState("");
  const CHAR_LIMIT = 48;

  // -------- Camera helpers --------
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    const v = videoRef.current;
    if (v) {
      v.pause?.();
      v.srcObject = null;
      v.removeAttribute("src");
    }
  };

  const listVideoInputs = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === "videoinput");
    } catch {
      return [];
    }
  };

  const pickDeviceIdForFacing = async (mode) => {
    const videos = await listVideoInputs();
    if (!videos.length) return null;

    const wantFront = mode === "user";
    const match = (label) => {
      const l = (label || "").toLowerCase();
      return wantFront
        ? l.includes("front") || l.includes("user")
        : l.includes("back") || l.includes("rear") || l.includes("environment");
    };

    const byLabel = videos.find((d) => match(d.label));
    if (byLabel) return byLabel.deviceId;
    return wantFront ? videos[videos.length - 1].deviceId : videos[0].deviceId;
  };

  const attachStream = async (s) => {
    setStream(s);
    const v = videoRef.current;
    if (v) {
      v.srcObject = s;
      v.setAttribute("playsinline", "true");
      v.muted = true;
      await v.play();
    }
  };

  const startCamera = async (mode = facingMode) => {
    setError("");
    try {
      stopStream();

      // 1) 정확 매칭
      try {
        const s1 = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { exact: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        await attachStream(s1);
        return;
      } catch {}

      // 2) 느슨 매칭
      try {
        const s2 = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        await attachStream(s2);
        return;
      } catch {}

      // 3) deviceId
      const deviceId = await pickDeviceIdForFacing(mode);
      if (deviceId) {
        const s3 = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        await attachStream(s3);
        return;
      }

      throw new Error("적합한 카메라를 찾을 수 없습니다.");
    } catch (e) {
      console.error(e);
      setError("카메라를 시작할 수 없어요. 권한/브라우저 지원을 확인하세요.");
    }
  };

  const switchCamera = async () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    await startCamera(next);
  };

  const capturePhoto = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        if (photoUrl) URL.revokeObjectURL(photoUrl);
        setPhotoUrl(url);
        setStep("preview");
      },
      "image/jpeg",
      0.92
    );
  };

  const handleSend = async () => {
    // 실제 업로드 API가 있다면 여기서 호출
    // await upload(photoBlob, message)
    setStep("sent");
  };

  const resetAll = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setMessage("");
    setStep("camera");
  };

  useEffect(() => {
    if (!("mediaDevices" in navigator)) {
      setError("브라우저가 카메라 API를 지원하지 않아요.");
      return;
    }
    startCamera();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Styles (피그마 레이아웃 매칭) --------
  const root = {
    width: 360,
    height: 800,
    position: "relative",
    background: "black",
    overflow: "hidden",
    margin: "20px auto",
  };
  const viewportWrap = {
    width: 360,
    height: 640,
    left: 0,
    top: 57,
    position: "absolute",
    overflow: "hidden",
    borderRadius: 40,
    background: "#000",
  };
  const statusBar = {
    width: 360,
    height: 44,
    left: 0,
    top: 0,
    position: "absolute",
    background: "black",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: "12px 18px",
    boxSizing: "border-box",
    fontWeight: 600,
  };
  const homeIndicator = {
    width: 129,
    height: 4.5,
    left: 244.5,
    top: 776,
    position: "absolute",
    transform: "rotate(180deg)",
    transformOrigin: "top left",
    background: "white",
    borderRadius: 90,
  };

  const topControls = {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pointerEvents: step === "camera" ? "auto" : "auto",
  };
  const roundIcon = {
    width: 40,
    height: 40,
    borderRadius: 999,
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.25)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  };

  //   style={{
  //   position: "absolute",
  //   left: "50%",
  //   transform: "translateX(-50%)",
  //   bottom: 132,
  //   background: "rgba(255,255,255,0.8)",
  //   color: "#111",
  //   padding: "8px 14px",
  //   borderRadius: 999,
  //   border: "1px solid rgba(0,0,0,0.06)",
  //   fontSize: 14,
  //   cursor: "pointer",
  // }}

  const bubble = {
    padding: "8px 12px",
    position: "absolute",
    left: "10%",
    right: "10%",
    bottom: 80,
    background: "white",
    boxShadow: "0px 1px 4px rgba(12,12,13,0.05)",
    borderRadius: 8,
    outline: "1px #D9D9D9 solid",
    color: "black",
    fontSize: 16,
    fontWeight: 600,
    textAlign: "center",
  };

  const centerBtnWrap = {
    width: 82,
    height: 82,
    left: 139,
    top: 660,
    position: "absolute",
    background: "#FF8C42",
    overflow: "hidden",
    borderRadius: 100,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  };

  const shutterBefore = {
    width: 82,
    height: 82,
    left: 139,
    top: 660,
    position: "absolute",
    borderRadius: 100,
    border: "5px solid #FF8C42",
    background: "white",
    cursor: "pointer",
  };

  // -------- UI --------
  return (
    <div style={root}>
      {/* 상태바(디자인용) */}
      <div style={statusBar}>
        <div style={{ fontSize: 15, lineHeight: "20px" }}>9:41</div>
      </div>

      {/* 촬영/미리보기 영역 */}
      <div style={viewportWrap}>
        {/* 비디오 or 사진 */}
        {step === "camera" ? (
          <video
            ref={videoRef}
            muted
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          photoUrl && (
            <img
              src={photoUrl}
              alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )
        )}

        {/* 상단 아이콘(좌: 플래시/우: 전환/닫기) */}
        <div style={topControls}>
          <div style={roundIcon} title="플래시(장식)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
                stroke="white"
                strokeWidth="1.6"
                fill="none"
              />
            </svg>
          </div>

          {step === "camera" ? (
            <div style={roundIcon} onClick={switchCamera} title="카메라 전환">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 7h7a5 5 0 0 1 5 5v1"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M6 10l1.5-3L11 8.5"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M17 17H10a5 5 0 0 1-5-5v-1"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M18 14l-1.5 3L13 15.5"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ) : (
            <div
              style={{
                ...roundIcon,
                background: "rgba(255,255,255,0.8)",
                color: "#111",
              }}
              onClick={resetAll}
              title="닫기"
            >
              ✕
            </div>
          )}
        </div>

        {/* 메시지 추가/입력/문구 고정 */}
        {step === "preview" && (
          <button
            onClick={() => setStep("typing")}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 80,
              background: "rgba(255,255,255,0.8)",
              color: "#111",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.06)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            메시지 추가
          </button>
        )}

        {step === "typing" && (
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 80,
              background: "rgba(255,255,255,0.8)",
              borderRadius: 16,
              padding: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <input
              autoFocus
              type="text"
              placeholder="인풋박스"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, CHAR_LIMIT))}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
              }}
            />
            <span style={{ fontSize: 12, color: "#333" }}>
              {/* {message.length}/{CHAR_LIMIT} */}
            </span>
          </div>
        )}

        {step === "typed" && !!message && (
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 80,
              background: "rgba(255,255,255,0.9)",
              color: "#111",
              padding: "12px 16px",
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            {message}
          </div>
        )}

        {/* 전송 완료 말풍선 (피그마 말풍선과 동일 위치/스타일) */}
        {step === "sent" && (
          <div style={bubble}>
            업로드 완료! <br />
            다른 러너의 스토리에 답장을 남겨보세요
          </div>
        )}
      </div>

      {/* 하단 중앙 버튼(상태별 이미지 교체) */}
      {step === "camera" ? (
        // 찍기 전: 흰 원 + 주황 테두리
        <div style={shutterBefore} onClick={capturePhoto} title="사진 찍기" />
      ) : step === "sent" ? (
        // 전송 완료: 체크 아이콘
        <div style={centerBtnWrap} onClick={resetAll} title="완료">
          <img
            src="/check.png"
            alt="완료"
            style={{ width: 85, height: 85, objectFit: "contain" }}
          />
        </div>
      ) : (
        // 찍은 후/입력 완료: 보내기(주황 배경 + send 아이콘)
        <div style={centerBtnWrap} onClick={handleSend} title="사진 보내기">
          <img
            src="/send.png"
            alt="보내기"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
        </div>
      )}

      {/* 홈 인디케이터(피그마 요소) */}
      <div style={homeIndicator} />

      {/* 오류 노출 */}
      {error && (
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 8,
            color: "#fca5a5",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
