import React from "react";

// 개별 스탯 아이템을 위한 작은 컴포넌트
const StatItem = ({ label, value }) => (
  <div className="stat-item">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);

const StatsPanel = ({ workoutData, mapErr, children }) => {
  return (
    <div className="stats-panel">
      {mapErr && <p className="error-message">{mapErr}</p>}

      <div className="stats-grid">
        <div className="stat-row">
          <StatItem label="시간" value={workoutData.time} />
          <div className="divider vertical" />
          <StatItem label="거리(km)" value={workoutData.distance} />
        </div>
        <div className="divider horizontal" />
        <div className="stat-row">
          <StatItem label="페이스" value={workoutData.pace} />
          <div className="divider vertical" />
          <StatItem label="칼로리" value={workoutData.calories} />
        </div>
      </div>

      {/* 자식으로 전달된 Controls 컴포넌트가 여기에 렌더링됩니다. */}
      {children}
    </div>
  );
};

export default StatsPanel;
