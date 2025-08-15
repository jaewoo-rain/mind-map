import React from "react";

// 1. 반복되는 코스 정보를 데이터 배열로 분리
const courseItems = [
  {
    id: "c1",
    title: "코스 1. 오름러너 코스",
    desc: "산봉우리들이 어우러진 아름다운 제주를 즐겨보면서",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=120&auto=format&fit=crop",
  },
  {
    id: "c2",
    title: "코스 2. 해안도로 코스",
    desc: "해안을 따라 파도를 즐기면서 제주도의 멋진 바다를 보세요. 돌고래",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=120&auto=format&fit=crop",
  },
  {
    id: "c3",
    title: "코스 3. 산과 바다 코스",
    desc: "산과 바다 모두를 볼 수 있는 코스! 조금 가파를 수도 있지만",
    img: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=120&auto=format&fit=crop",
  },
];

// 2. 전체 페이지 컴포넌트
export default function RunnerCoursePage() {
  return (
    // Pretendard 폰트 적용을 위해 className 추가 (선택사항)
    <div className="font-[Pretendard,system-ui,sans-serif] flex justify-center bg-gray-200">
      {/* 모바일 화면 프레임 */}
      <div className="relative w-[393px] h-[852px] bg-white overflow-hidden flex flex-col">
        {/* 상단 지도 이미지 */}
        <div className="shrink-0 h-[469px]">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1533107842261-4432095817c8?q=80&w=800"
            alt="지도 배경"
          />
        </div>

        {/* 하단 정보 패널 */}
        <InfoPanel />

        {/* 하단 고정 탭 메뉴 */}
        <BottomTabs />
      </div>
    </div>
  );
}

// 3. 정보 패널 컴포넌트 (안내 문구 + 코스 목록)
function InfoPanel() {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-t-[20px] -mt-5 relative z-10">
      {/* 드래그 핸들 */}
      <div className="py-2 flex justify-center shrink-0">
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      {/* 안내 문구 */}
      <div className="text-center px-5 pt-2 pb-4 shrink-0">
        <p className="text-lg leading-relaxed text-gray-800">
          000님을 위한 코스 ! <br />
          사진 스팟에 들어가면{" "}
          <span className="font-bold text-[#01B99F]">기록하기</span>가 활성화
          됩니다
        </p>
      </div>

      {/* 구분선 */}
      <div className="px-5 shrink-0">
        <div className="h-px bg-gray-300" />
      </div>

      {/* 코스 목록 (스크롤 영역) */}
      <div className="flex-1 overflow-y-auto">
        {courseItems.map((item, index) => (
          <CourseItem
            key={item.id}
            imgSrc={item.img}
            title={item.title}
            description={item.desc}
            isLast={index === courseItems.length - 1}
          />
        ))}
        {/* 하단 탭 높이만큼 공간 확보 */}
        <div className="h-24" />
      </div>
    </div>
  );
}

// 4. 반복되는 코스 아이템을 별도 컴포넌트로 분리
function CourseItem({ imgSrc, title, description, isLast }) {
  // 설명 텍스트를 두 줄로 제한하는 스타일
  const twoLineEllipsis = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-4">
        {/* 왼쪽 (이미지 + 텍스트) */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img
            src={imgSrc}
            alt={title}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-black truncate">{title}</h3>
            <p className="text-sm text-gray-400 mt-1" style={twoLineEllipsis}>
              {description}
            </p>
          </div>
        </div>

        {/* 오른쪽 (자세히 버튼) */}
        <button className="flex items-center gap-1.5 ml-4 shrink-0 text-gray-400 hover:text-black transition-colors">
          <span className="text-xs">자세히</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 3L11 8L6 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {/* 마지막 아이템이 아니면 구분선 표시 */}
      {!isLast && <div className="h-px bg-gray-100" />}
    </div>
  );
}

// 5. 하단 탭 메뉴 컴포넌트
function BottomTabs() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full bg-white z-20">
      {/* 상단 경계선 */}
      <div className="border-t border-gray-200" />
      {/* 탭 아이콘 영역 */}
      <div className="grid grid-cols-3 text-center py-1">
        <TabItem label="감정 쪽지" isActive={false} />
        <TabItem label="추천 스팟" isActive={true} />
        <TabItem label="타임라인" isActive={false} />
      </div>
      {/* iOS 홈 인디케이터 영역 */}
      <div className="h-[34px] flex justify-center items-end pb-2">
        <div className="w-[134px] h-[5px] bg-black rounded-full" />
      </div>
    </div>
  );
}

// 6. 탭 아이템 컴포넌트
function TabItem({ label, isActive }) {
  // 아이콘은 임시로 네모로 표시
  const iconStyle = `w-6 h-6 rounded ${isActive ? "bg-black" : "bg-gray-400"}`;
  const textStyle = `text-xs ${
    isActive ? "text-black font-semibold" : "text-gray-500"
  }`;

  return (
    <button className="flex flex-col items-center justify-center gap-1 py-1">
      <div className={iconStyle} />
      <span className={textStyle}>{label}</span>
    </button>
  );
}
