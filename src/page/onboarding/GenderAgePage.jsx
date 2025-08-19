import React, { useMemo, useState } from "react";

const AGE_GROUPS = ["10대", "20대", "30대", "40대", "50대"];

export default function GenderAgePage({
  defaultGender = null, // 'male' | 'female'
  defaultAgeGroup = null, // '10대' | ...
  onBack,
  onNext,
}) {
  const [gender, setGender] = useState(defaultGender);
  const [ageGroup, setAgeGroup] = useState(defaultAgeGroup);
  const canProceed = useMemo(() => !!gender && !!ageGroup, [gender, ageGroup]);

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
      {/* 진행 표시 (예: 10%) */}
      <div
        style={{
          width: 273,
          height: 44,
          paddingTop: 10,
          paddingBottom: 10,
          left: 43,
          top: 68,
          position: "absolute",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: 273, height: 44, position: "relative" }}>
          <div
            style={{
              width: 241,
              height: 4,
              left: 16,
              top: 20,
              position: "absolute",
              background: "#F0F0F2",
            }}
          >
            <div
              style={{
                width: 32.71,
                height: 4,
                left: 0,
                top: 0,
                position: "absolute",
                background: "#1E1E22",
                borderRadius: 100,
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: 24,
            height: 24,
            background: "#1E1E22",
            borderRadius: 9999,
          }}
        />
        <div
          style={{
            width: 24,
            height: 24,
            background: "#F0F0F2",
            borderRadius: 9999,
          }}
        />
      </div>

      {/* 질문 제목 */}
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
          러너님의 성별과 나이는?
        </div>
      </div>

      {/* 성별 선택 */}
      <div
        style={{
          left: 37,
          top: 243,
          position: "absolute",
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
        }}
      >
        {/* 남자 */}
        <button
          onClick={() => setGender("male")}
          aria-pressed={gender === "male"}
          style={{
            width: 128,
            height: 128,
            position: "relative",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
            background: gender === "male" ? "#1E1E22" : "#C4C4C6",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 45,
              top: 51,
              color: gender === "male" ? "#FCFCFC" : "#626264",
              fontSize: 22,
              fontFamily: "Pretendard",
              fontWeight: 600,
            }}
          >
            남자
          </div>
        </button>

        {/* 여자 */}
        <button
          onClick={() => setGender("female")}
          aria-pressed={gender === "female"}
          style={{
            width: 128,
            height: 128,
            position: "relative",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
            background: gender === "female" ? "#1E1E22" : "#C4C4C6",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 45,
              top: 51,
              color: gender === "female" ? "#FCFCFC" : "#626264",
              fontSize: 22,
              fontFamily: "Pretendard",
              fontWeight: 600,
            }}
          >
            여자
          </div>
        </button>
      </div>

      {/* 나이 선택 */}
      <div
        style={{
          width: 328,
          left: 16,
          top: 401,
          position: "absolute",
          display: "inline-flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {AGE_GROUPS.map((group) => {
          const active = ageGroup === group;
          return (
            <button
              key={group}
              onClick={() => setAgeGroup(group)}
              aria-pressed={active}
              style={{
                width: 328,
                height: 50,
                padding: 10,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: active ? "#1E1E22" : "#C4C4C6",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  color: active ? "#FCFCFC" : "#626264",
                  fontSize: 22,
                  fontFamily: "Pretendard",
                  fontWeight: 600,
                }}
              >
                {group}
              </div>
            </button>
          );
        })}
      </div>

      {/* 뒤로/다음 */}
      {onBack && (
        <button
          onClick={onBack}
          title="뒤로"
          style={{
            width: 50,
            height: 50,
            left: 16,
            top: 710,
            position: "absolute",
            borderRadius: 8,
            border: "1px solid #1E1E22",
            background: "white",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              margin: "auto",
              borderLeft: "2px solid #1E1E22",
              borderBottom: "2px solid #1E1E22",
              transform: "rotate(135deg)",
            }}
          />
        </button>
      )}

      <button
        onClick={() => canProceed && onNext && onNext(gender, ageGroup)}
        disabled={!canProceed}
        title="다음"
        style={{
          width: 50,
          height: 50,
          left: 294,
          top: 710,
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
