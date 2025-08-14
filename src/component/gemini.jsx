import React, { useEffect, useRef, useState } from "react";

/**
 * React 카메라 컴포넌트 (웹)
 * - 목표: 이미지와 같이 전체 화면 비디오와 하단 컨트롤 버튼 레이아웃 구현
 * - HTTPS 또는 localhost 환경에서만 동작합니다.
 * - 모바일: "환경(후면)"/"사용자(전면)" 카메라 전환을 지원합니다.
 * - 기능: 사진 캡처, 앨범에서 사진 선택, 카메라 전환
 */
export default function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // 'user' 또는 'environment'
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(true); // 처음에는 자동으로 시작 시도

  // ===== 스트림 및 카메라 제어 함수 =====

  // 현재 스트림 중지
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // 카메라 시작
  const startCamera = async (mode = facingMode) => {
    stopStream(); // 기존 스트림이 있다면 중지
    setError("");
    setIsStarting(true);

    try {
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 }, // 고화질을 위해 해상도 상향
          height: { ideal: 1080 },
        },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        // iOS Safari에서 전체 화면으로 자동 전환되는 것을 방지
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }
    } catch (e) {
      console.error("카메라 시작 오류:", e);
      setError(
        "카메라를 시작할 수 없습니다. 권한을 허용했는지 또는 HTTPS로 접속했는지 확인해주세요."
      );
    } finally {
      setIsStarting(false);
    }
  };

  // 전/후면 카메라 전환
  const switchCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode); // 새로운 모드로 카메라 다시 시작
  };

  // 사진 촬영
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !stream) return;

    // 비디오의 실제 해상도로 캔버스 크기 설정
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    // 비디오 프레임을 캔버스에 그리기
    context.drawImage(video, 0, 0, width, height);

    // 캔버스 이미지를 Blob 데이터로 변환
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Blob을 URL로 만들어 다운로드나 표시에 사용
          const url = URL.createObjectURL(blob);
          console.log("캡처된 사진 URL:", url);
          // 여기서 캡처된 이미지 URL(url)을 상태에 저장하거나 다른 처리 수행

          // 임시로 다운로드 링크 생성 및 클릭
          const a = document.createElement("a");
          a.href = url;
          a.download = `capture_${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url); // 메모리 해제
        }
      },
      "image/jpeg",
      0.95 // 이미지 품질
    );
  };

  // 파일(앨범)에서 이미지 선택 시 처리
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      console.log("선택된 파일 URL:", url);
      // 여기서 선택된 이미지 URL(url)을 상태에 저장하거나 미리보기 표시
    }
  };

  // ===== 컴포넌트 생명주기 =====

  // 컴포넌트 마운트 시 카메라 자동 시작
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저는 카메라 API를 지원하지 않습니다.");
      return;
    }
    startCamera();

    // 언마운트 시 스트림 정리
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.container}>
      {/* 상단: 카메라 비디오 뷰 */}
      <div style={styles.videoContainer}>
        <video ref={videoRef} muted autoPlay style={styles.video} />
        {isStarting && (
          <div style={styles.loadingOverlay}>카메라 로딩 중...</div>
        )}
        {error && <div style={styles.errorOverlay}>{error}</div>}
      </div>

      {/* 하단: 컨트롤 버튼 */}
      <div style={styles.controlsContainer}>
        {/* 왼쪽: 앨범 버튼 */}
        <label style={styles.controlButton}>
          앨범
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            style={{ display: "none" }}
          />
        </label>

        {/* 중앙: 사진 촬영 버튼 */}
        <button
          onClick={capturePhoto}
          disabled={!stream || isStarting}
          style={styles.captureButton}
          aria-label="사진 촬영"
        />

        {/* 오른쪽: 카메라 전환 버튼 */}
        <button
          onClick={switchCamera}
          disabled={!stream || isStarting}
          style={styles.controlButton}
        >
          전환
        </button>
      </div>

      {/* 사진 캡처에 사용될 숨겨진 캔버스 */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// ===== 스타일 객체 =====

const styles = {
  container: {
    width: "100%",
    height: "100vh", // 전체 화면 높이
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column",
    position: "relative", // 오버레이를 위한 기준점
  },
  videoContainer: {
    flex: 1, // 남은 공간을 모두 차지
    position: "relative",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // 컨테이너에 꽉 차게 표시
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  errorOverlay: {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    right: "20px",
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    color: "white",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
  },
  controlsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
  captureButton: {
    width: "70px",
    height: "70px",
    borderRadius: "50%", // 원형 버튼
    backgroundColor: "white",
    border: "4px solid black",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    cursor: "pointer",
  },
};
