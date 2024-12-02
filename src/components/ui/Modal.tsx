import React, { useEffect, useRef } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "max-w-md",
}:{
  isOpen: boolean,
  onClose: () => void,
  title: string,
  children: React.ReactNode,
  className?: string
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | MouseEvent
    ) => {
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="custom-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 1010, margin: "0 !important" }}
    >
      <div
        ref={modalRef}
        className={`my-4 bg-white rounded p-6 w-full max-h-[600px] overflow-y-auto relative ${className} `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-darkergray"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        {title && <h4 className="w-full text-center">{title}</h4>}
        
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
