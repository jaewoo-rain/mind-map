import React, { useState } from "react";

export default function NicknamePage({ defaultNickname = "", onNext }) {
  const [nickname, setNickname] = useState(defaultNickname);
  const canProceed = nickname.trim().length > 0;

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
      {/* 안내 텍스트 */}
      <div
        style={{
          left: 54,
          top: 68,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#1E1E22",
            fontSize: 16,
            fontFamily: "Pretendard",
            fontWeight: 500,
          }}
        >
          반갑습니다 러너님 ! 러너님의 개성이 담긴
        </div>
        <div
          style={{
            textAlign: "center",
            color: "#1E1E22",
            fontSize: 24,
            fontFamily: "Pretendard",
            fontWeight: 700,
          }}
        >
          닉네임을 정해주세요
        </div>
      </div>

      {/* 아바타(이모티콘) */}
      <img
        src="/emoticon.png"
        alt="emoticon avatar"
        style={{
          width: 150,
          height: 150,
          left: 102,
          top: 149,
          position: "absolute",
          objectFit: "contain",
          borderRadius: "50%",
        }}
      />

      {/* 닉네임 입력 */}
      <div
        style={{
          width: 328,
          height: 56,
          left: 16,
          top: 317,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            borderRadius: 4,
            outline: "3px #1E1E22 solid",
            outlineOffset: -3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              paddingTop: 4,
              paddingBottom: 4,
              paddingLeft: 16,
              display: "inline-flex",
              gap: 4,
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* 라벨 */}
            <div
              style={{
                padding: "0 4px",
                left: -4,
                top: -12,
                position: "absolute",
                background: "#FCFCFC",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: "#1E1E22",
                  fontSize: 12,
                  fontFamily: "Pretendard",
                  fontWeight: 500,
                }}
              >
                러너 별명
              </div>
            </div>
            {/* 입력창 */}
            <input
              type="text"
              placeholder="닉네임 입력"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{
                flex: 1,
                height: 48,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 16,
                fontFamily: "Pretendard",
                color: "#1E1E22",
              }}
            />
            {/* X(지우기) 버튼 */}
            {nickname && (
              <button
                onClick={() => setNickname("")}
                aria-label="clear nickname"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#F4F4F5",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 4,
                }}
              >
                <span style={{ fontSize: 20, color: "#1E1E22", lineHeight: 1 }}>
                  ×
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={() => canProceed && onNext && onNext(nickname.trim())}
        disabled={!canProceed}
        title="다음"
        style={{
          width: 50,
          height: 50,
          left: 294,
          top: 471,
          position: "absolute",
          borderRadius: 8,
          border: "none",
          background: canProceed ? "#1E1E22" : "#C4C4C6",
          cursor: canProceed ? "pointer" : "not-allowed",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            margin: "auto",
            borderLeft: "2px solid #FCFCFC",
            borderBottom: "2px solid #FCFCFC",
            transform: "rotate(-45deg)",
          }}
        />
      </button>
    </div>
  );
}
