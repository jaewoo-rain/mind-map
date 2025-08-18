import React from "react";

const StopConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p className="modal-title">
          달리기를 <span className="highlight">종료</span>하시겠습니까?
        </p>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>
            계속 달릴래요
          </button>
          <button className="modal-btn confirm" onClick={onConfirm}>
            그만 달릴래요
          </button>
        </div>
      </div>
    </div>
  );
};

export default StopConfirmModal;
