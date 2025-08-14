import React, { useEffect, useRef, useState } from "react";

export default function CameraCaptureMobile() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "user" | "environment"
  const [photoUrl, setPhotoUrl] = useState(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  // ---- helpers ----
  const clearVideo = () => {
    const v = videoRef.current;
    if (v) {
      v.pause?.();
      v.srcObject = null; // iOS Safari 전환 안정화에 중요
      v.removeAttribute("src");
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    clearVideo();
  };

  // 사용 가능한 비디오 입력 목록
  const listVideoInputs = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === "videoinput");
    } catch {
      return [];
    }
  };

  // 전면/후면에 맞는 deviceId 찾기
  const pickDeviceIdForFacing = async (mode) => {
    const videos = await listVideoInputs();
    if (!videos.length) return null;

    // 레이블 기반 휴리스틱
    const wantFront = mode === "user";
    const match = (label) => {
      const l = (label || "").toLowerCase();
      return wantFront
        ? l.includes("front") || l.includes("user")
        : l.includes("back") || l.includes("rear") || l.includes("environment");
    };

    // 1) 라벨로 확실히 구분되는 것 우선
    const byLabel = videos.find((d) => match(d.label));
    if (byLabel) return byLabel.deviceId;

    // 2) 구분 불가하면: 기기별로 보통 0/1이 앞/뒤 중 하나
    //    전면 요청이면 마지막, 후면이면 첫 번째를 가정(경험적)
    return wantFront ? videos[videos.length - 1].deviceId : videos[0].deviceId;
  };

  // 카메라 시작(다중 폴백)
  const startCamera = async (mode = facingMode) => {
    setError("");
    setIsStarting(true);
    try {
      // 먼저 기존 스트림/비디오 정리
      stopStream();

      // 1) exact 시도
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
      } catch (e) {
        // 계속 진행 (무시)
      }

      // 2) 문자열 형태 시도
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
      } catch (e) {
        // 계속 진행
      }

      // 3) deviceId 직접 선택
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
      setError(
        "카메라를 시작할 수 없어요. 권한 또는 브라우저 지원을 확인하세요."
      );
    } finally {
      setIsStarting(false);
    }
  };

  const attachStream = async (s) => {
    setStream(s);
    const v = videoRef.current;
    if (v) {
      v.srcObject = s;
      v.setAttribute("playsinline", "true"); // iOS 전체화면 방지
      v.muted = true;
      await v.play();
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
      },
      "image/jpeg",
      0.92
    );
  };

  const onChooseFromAlbum = () => fileInputRef.current?.click();
  const onAlbumChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(url);
  };

  useEffect(() => {
    if (!("mediaDevices" in navigator)) {
      setError(
        "이 브라우저는 카메라 API를 지원하지 않습니다. 앨범에서 선택하세요."
      );
      return;
    }
    startCamera().catch(() => {});
    return () => {
      stopStream();
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== 아래는 UI (이전과 동일) ======
  const wrap = {
    width: "100%",
    maxWidth: 430,
    margin: "0 auto",
    padding: "12px 12px 24px",
    background: "#000",
    color: "#fff",
    minHeight: "100vh",
    boxSizing: "border-box",
  };
  const frame = {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#111",
    borderRadius: 28,
    border: "4px solid #3b82f6",
    overflow: "hidden",
    marginTop: 8,
    position: "relative",
  };
  const videoStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };
  const controls = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px 8px",
  };
  const iconBtn = {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "transparent",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.18)",
    cursor: "pointer",
  };
  const shutterWrap = {
    position: "relative",
    width: 86,
    height: 86,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "4px solid #fbbf24",
    boxShadow: "0 0 0 2px rgba(0,0,0,0.5) inset",
    cursor: "pointer",
  };
  const shutterCore = {
    width: 68,
    height: 68,
    borderRadius: "50%",
    background: "#fff",
  };
  const previewOverlay = { position: "absolute", inset: 0, background: "#000" };
  const clearBtn = {
    position: "absolute",
    right: 8,
    bottom: 8,
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 10,
    fontSize: 12,
    cursor: "pointer",
  };

  return (
    <div style={wrap}>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: "4px 2px 6px" }}>
        React Camera
      </h2>

      <div style={frame}>
        <video ref={videoRef} muted autoPlay playsInline style={videoStyle} />
        {photoUrl && (
          <>
            <img
              src={photoUrl}
              alt="captured"
              style={{
                ...previewOverlay,
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
            />
            <button style={clearBtn} onClick={() => setPhotoUrl(null)}>
              미리보기 닫기
            </button>
          </>
        )}
      </div>

      <div style={controls}>
        <button
          style={iconBtn}
          onClick={onChooseFromAlbum}
          title="앨범에서 선택"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="white"
              strokeWidth="1.6"
            />
            <circle cx="9" cy="10" r="2.2" stroke="white" strokeWidth="1.6" />
            <path
              d="M5 17l4.5-4.5L14 17l3-3 2 3"
              stroke="white"
              strokeWidth="1.6"
              fill="none"
            />
          </svg>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAlbumChange}
            style={{ display: "none" }}
          />
        </button>

        <div style={shutterWrap} onClick={capturePhoto} title="사진 찍기">
          <div style={shutterCore} />
        </div>

        <button
          style={iconBtn}
          onClick={switchCamera}
          disabled={isStarting}
          title={
            facingMode === "environment" ? "전면 카메라로" : "후면 카메라로"
          }
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
              fill="none"
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
              fill="none"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 10, color: "#fca5a5", fontSize: 14 }}>
          {error}
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
