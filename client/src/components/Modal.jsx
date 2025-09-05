import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg z-50 w-full max-w-md max-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Modal;
