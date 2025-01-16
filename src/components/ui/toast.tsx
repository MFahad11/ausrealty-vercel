import React from "react";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const CustomToast = ({ type, message }:{
  type: "error" | "success",
  message: string
}) => (
  <div className="flex items-center z-[10000] mt-2">
    <div className="mr-2">
      {type === "error" ? <ErrorIcon /> : <SuccessIcon />}
    </div>
    <div>{message}</div>
  </div>
);

export const showToast = (type: "error" | "success"
  , message:string) => {
  toast(<CustomToast type={type} message={message} />, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: "text-darkergray sm:w-max m-2 z-[10000] mt-2",
  });
};
