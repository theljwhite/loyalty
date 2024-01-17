import React from "react";
import { SpinnerOne } from "../Misc/Spinners";

interface LoadingToastProps {
  message: string;
  showSignMessage?: boolean;
}

export default function LoadingToast({
  message,
  showSignMessage,
}: LoadingToastProps) {
  return (
    <div className="flex items-center gap-2 pl-4">
      <SpinnerOne size={20} />
      <div className="flex flex-col">
        <p className="text-[14px] font-bold">{message}</p>
        {showSignMessage && (
          <p className="text-[12px]">Check your wallet to sign transactions.</p>
        )}
      </div>
    </div>
  );
}
