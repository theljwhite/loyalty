import React from "react";
import { toast } from "react-toastify";
import LoadingToast from "./LoadingToast";
import ErrorToast from "./ErrorToast";
import SuccessToast from "./SuccessToast";

let toastId: any = null;

const defaultSettings = {
  autoClose: 3000,
  icon: true,
  onClose: () => {
    toastId = null;
  },
};

const makeToast = (type: any, content: JSX.Element, moreSettings: any = {}) => {
  const settings = { ...defaultSettings, ...moreSettings, type };
  if (toastId) toast.dismiss(toastId);
  toastId = toast(content, settings);
};

export const dismissToast = () => {
  if (toastId) {
    toast.dismiss(toastId);
    toastId = null;
  }
};

export const toastLoading = (message: string, showSignMessage?: boolean) => {
  makeToast(
    toast.info,
    <LoadingToast message={message} showSignMessage={showSignMessage} />,
    { autoClose: false },
  );
};

export const toastError = (message: string) => {
  makeToast(toast.error, <ErrorToast message={message} />, {
    autoClose: false,
  });
};

export const toastSuccess = (message: string) => {
  makeToast(toast.success, <SuccessToast message={message} />);
};
