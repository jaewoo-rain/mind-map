import React from "react";

const Controls = ({ onMyLocationClick, onStopClick, onPauseClick }) => {
  return (
    <div className="controls">
      <button className="btn btn-location" onClick={onMyLocationClick}>
        📍 내 위치
      </button>
      <button className="btn btn-stop" onClick={onStopClick}>
        종료
      </button>
      <button className="btn btn-pause" onClick={onPauseClick}>
        멈추기
      </button>
    </div>
  );
};

export default Controls;
