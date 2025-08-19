// src/page/StoryRepliesRoute.jsx
import React from "react";
import { useLocation, Navigate } from "react-router-dom";

import StoryRepliesPage from "./StoryRepliesPage";

export default function StoryRepliesRoute() {
  const { state } = useLocation();
  const payload = state?.payload;

  // 직접 접근 시 카메라로 되돌림
  if (!payload) return <Navigate to="/camera" replace />;

  const myStory = {
    author: payload.author || "러너닉네임",
    avatar: "https://placehold.co/30x30?text=ME",
    timeAgo: "방금",
    photo: payload.photoUrl,
    caption: payload.caption,
  };

  // TODO: 서버에서 받아오도록 교체
  const others = [
    {
      id: "a1",
      author: "Luna",
      avatar: "https://placehold.co/30x30?text=L",
      timeAgo: "2시간",
      photo:
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop",
      caption: "오름에서 본 풍경 bb",
    },
    {
      id: "a2",
      author: "Ming",
      avatar: "https://placehold.co/30x30?text=M",
      timeAgo: "9시간",
      photo:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      caption: "러닝 끝난 뒤 바다",
    },
  ];

  return (
    <StoryRepliesPage
      locationName={payload.locationName || "함덕해수욕장"}
      myStory={myStory}
      others={others}
    />
  );
}
