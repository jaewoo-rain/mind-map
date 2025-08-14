import React, { useEffect, useRef, useState } from "react";

/**
 * React Camera Capture (Web)
 * - HTTPS or localhost에서 동작합니다.
 * - 모바일: "환경(후면)"/"사용자(전면)" 카메라 전환 지원 (가능한 경우)
 * - 사진 캡처 → Blob/다운로드/미리보기
 * - 카메라 권한 거부/미지원 시 <input type="file" accept="image/*" capture> 폴백 제공
 */
export default function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // 'user' | 'environment'
  const [photoUrl, setPhotoUrl] = useState(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  // ===== Helpers =====
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const startCamera = async (mode = facingMode) => {
    setError("");
    setIsStarting(true);
    setPhotoUrl(null);
    try {
      // 권장: ideal 사용 (일부 브라우저에서 exact는 실패 가능)
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      // Safari iOS 등 호환을 위해 실패 시 일반 요청으로 폴백
      let s = await navigator.mediaDevices.getUserMedia(constraints);
      if (!s)
        s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      stopStream();
      setStream(s);

      const v = videoRef.current;
      if (v) {
        v.srcObject = s;
        v.setAttribute("playsinline", "true"); // iOS Safari에서 전체화면 방지
        await v.play();
      }
    } catch (e) {
      console.error(e);
      setError(
        "카메라를 시작할 수 없어요. 권한 또는 브라우저 지원을 확인하세요."
      );
    } finally {
      setIsStarting(false);
    }
  };

  const switchCamera = async () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    stopStream();
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
    ctx.drawImage(v, 0, 0, w, h);
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        // 기존 URL 정리
        if (photoUrl) URL.revokeObjectURL(photoUrl);
        setPhotoUrl(url);
      },
      "image/jpeg",
      0.92
    );
  };

  const downloadPhoto = () => {
    if (!photoUrl) return;
    const a = document.createElement("a");
    a.href = photoUrl;
    a.download = `photo_${Date.now()}.jpg`;
    a.click();
  };

  const onFileFallback = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 파일 선택 시 미리보기
    const url = URL.createObjectURL(file);
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(url);
  };

  useEffect(() => {
    if (!("mediaDevices" in navigator)) {
      setError(
        "이 브라우저는 카메라 API를 지원하지 않습니다. 파일 업로드 폴백을 사용하세요."
      );
      return;
    }
    // 자동 시작을 원하면 주석 해제
    startCamera().catch(() => {});

    // 언마운트 시 정리
    return () => {
      stopStream();
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>React Camera Capture</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left: Live Preview */}
        <div
          style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <button onClick={() => startCamera()} disabled={isStarting}>
              {isStarting ? "시작 중..." : "카메라 시작"}
            </button>
            <button onClick={switchCamera} disabled={!stream}>
              카메라 전환 (
              {facingMode === "environment" ? "후면→전면" : "전면→후면"})
            </button>
            <button onClick={stopStream} disabled={!stream}>
              정지
            </button>
            <button onClick={capturePhoto} disabled={!stream}>
              📸 사진 찍기
            </button>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              background: "#111",
            }}
          >
            <video
              ref={videoRef}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
              }}
              autoPlay
            />
          </div>

          {error && <p style={{ color: "#b91c1c", marginTop: 8 }}>{error}</p>}

          {/* Fallback: 파일 업로드 (모바일 카메라 호출 가능) */}
          <div style={{ marginTop: 10, fontSize: 14, color: "#374151" }}>
            카메라가 되지 않나요?
            <label
              style={{ marginLeft: 8, cursor: "pointer", color: "#2563eb" }}
            >
              파일에서 선택
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileFallback}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* Right: Snapshot Preview */}
        <div
          style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}
        >
          <h3 style={{ marginBottom: 8 }}>Snapshot</h3>
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              background: "#111",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="snapshot"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                캡처된 이미지가 여기에 표시됩니다.
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={downloadPhoto} disabled={!photoUrl}>
              다운로드
            </button>
            <button onClick={() => setPhotoUrl(null)} disabled={!photoUrl}>
              삭제
            </button>
          </div>

          {/* 숨김 캔버스 - 실제 캡처 처리에 사용 */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>

      <ul style={{ marginTop: 16, color: "#374151", lineHeight: 1.6 }}>
        <li>
          ⚠️ <b>HTTPS</b> 또는 <b>localhost</b>에서만 카메라 접근이 허용됩니다.
        </li>
        <li>
          📱 iOS Safari에서는 <code>playsInline</code> 속성이 있어야 전체
          화면으로 전환되지 않습니다.
        </li>
        <li>
          🔁 일부 기기에서 전·후면 전환이 제한될 수 있습니다(브라우저/기기
          정책).
        </li>
        <li>
          🖼️ 더 높은 해상도를 원하면 <code>video.width/height ideal</code>을
          조정하세요. 실제 저장 해상도는 <code>video.videoWidth/Height</code>로
          결정됩니다.
        </li>
      </ul>
    </div>
  );
}
