// src/page/CameraPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import CameraCaptureMobile from "./Camera/CameraCaptureMobile";

export default function CameraPage() {
  const navigate = useNavigate();
  return (
    <CameraCaptureMobile
      nickname="러너닉네임"
      locationName="함덕해수욕장"
      onNext={(payload) => {
        // /stories 로 이동하면서 촬영 결과 전달
        navigate("/stories", { state: { payload } });
      }}
    />
  );
}
