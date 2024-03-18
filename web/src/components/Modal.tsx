import React from "react";

type ModalProps = {
  children: React.ReactNode;
  open: boolean;
};

function Modal({ children, open }: ModalProps) {
  return (
    <div
      className={`bg-black/70 absolute justify-center items-center w-full h-full z-50 ${
        open ? "flex" : "hidden"
      }`}>
      <div className="w-full text-center bg-background-900 text-white py-4 px-3">{children}</div>
    </div>
  );
}

export default Modal;
