// src/OnboardingFlow.jsx
import React, { useMemo, useState } from "react";
import NicknamePage from "./NickNamePage";
import GenderAgePage from "./GenderAgePage";
import TravelPreferencePage from "./TravelPreferencePage";
import RegionSelectPage from "./RegionSelectPage";
import TravelReasonPage from "./TravelReasonPage";
import TravelStyleIntroPage from "./TravelStyleIntroPage";
import TravelDistancePage from "./TravelDistancePage";
import RunningLevelPage from "./RunningLevelPage";
import FinalizingPage from "./FinalizingPage";

/**
 * 온보딩 스텝 정의
 * 0: 닉네임
 * 1: 성별/나이
 * 2: 여행 취향
 * 3: 지역 선택
 * 4: 여행 이유
 * 5: 러닝 스타일 인트로
 * 6: 러닝 거리 선택
 * 7: 러닝 수준 선택
 * 8: 마지막 저장/로딩 → /recommend
 */
export default function OnboardingFlow() {
  const [step, setStep] = useState(0);

  const [profile, setProfile] = useState({
    nickname: "",
    gender: null, // 'male' | 'female'
    ageGroup: null, // '10대' | '20대' | '30대' | '40대' | '50대'
    travelPref: null, // 'nature' | 'city'
    region: null, // '동부' | '서부' | '남부' | '북부'
    travelReason: null, // 문자열
    distance: null, // '5km 미만' | '5~10km' | '10km 이상'
    runningLevel: null, // 문자열
  });

  const totalSteps = 9;
  const progress = useMemo(
    () => Math.round(((step + 1) / totalSteps) * 100),
    [step]
  );

  // ---- 다음 스텝으로 넘기는 핸들러들 ----
  const handleFromNickname = (nickname) => {
    setProfile((p) => ({ ...p, nickname }));
    setStep(1);
  };

  const handleFromGenderAge = (gender, ageGroup) => {
    setProfile((p) => ({ ...p, gender, ageGroup }));
    setStep(2);
  };

  const handleFromTravelPref = (travelPref) => {
    setProfile((p) => ({ ...p, travelPref }));
    setStep(3);
  };

  const handleFromRegion = (region) => {
    setProfile((p) => ({ ...p, region }));
    setStep(4);
  };

  const handleFromTravelReason = (travelReason) => {
    setProfile((p) => ({ ...p, travelReason }));
    setStep(5);
  };

  const handleFromIntro = () => {
    setStep(6);
  };

  const handleFromDistance = (distance) => {
    setProfile((p) => ({ ...p, distance }));
    setStep(7);
  };

  const handleFromRunningLevel = (runningLevel) => {
    setProfile((p) => ({ ...p, runningLevel }));
    setStep(8);
  };

  // 공통 뒤로가기
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div
      style={{
        position: "relative",
        width: 360,
        height: 800,
        margin: "20px auto",
      }}
    >
      {/* (옵션) 디버그용 전체 진행률 — 필요없으면 삭제 */}
      <div
        style={{
          position: "fixed",
          left: 8,
          bottom: 8,
          fontSize: 12,
          color: "#888",
          userSelect: "none",
          zIndex: 99,
        }}
      >
        progress: {progress}% (step {step + 1}/{totalSteps})
      </div>

      {/* 각 스텝 렌더링 */}
      {step === 0 && (
        <NicknamePage
          defaultNickname={profile.nickname}
          onNext={handleFromNickname}
        />
      )}

      {step === 1 && (
        <GenderAgePage
          defaultGender={profile.gender}
          defaultAgeGroup={profile.ageGroup}
          onBack={goBack}
          onNext={handleFromGenderAge}
        />
      )}

      {step === 2 && (
        <TravelPreferencePage
          defaultPreference={profile.travelPref}
          onBack={goBack}
          onNext={handleFromTravelPref}
        />
      )}

      {step === 3 && (
        <RegionSelectPage onBack={goBack} onNext={handleFromRegion} />
      )}

      {step === 4 && (
        <TravelReasonPage onBack={goBack} onNext={handleFromTravelReason} />
      )}

      {step === 5 && <TravelStyleIntroPage onNext={handleFromIntro} />}

      {step === 6 && (
        <TravelDistancePage
          defaultDistance={profile.distance}
          // 필요시 진행바 % 조절 가능 (기본 30%)
          // progressPercent={30}
          onBack={goBack}
          onNext={handleFromDistance}
        />
      )}

      {step === 7 && (
        <RunningLevelPage
          defaultLevel={profile.runningLevel}
          // 필요시 진행바 % 조절 가능 (기본 60%)
          // progressPercent={60}
          onBack={goBack}
          onNext={handleFromRunningLevel}
        />
      )}

      {step === 8 && (
        <FinalizingPage
          nickname={profile.nickname || "러너님"}
          profile={profile}
          durationMs={1500} // 고정 시간 원하면 설정 (기본 1000~2000ms 랜덤)
          saveUrl="/api/onboarding/complete" // 서버 저장/조회 엔드포인트
          recommendPath="/recommend" // 완료 후 이동 경로
          onComplete={(serverData) => {
            // 서버 응답을 profile에 합치고 싶으면 사용
            if (serverData) {
              setProfile((p) => ({ ...p, serverData }));
            }
          }}
        />
      )}
    </div>
  );
}
