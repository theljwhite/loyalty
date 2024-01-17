import React from "react";
import Image from "next/image";

interface ErrorToastProps {
  message: string;
}

export default function ErrorToast({ message }: ErrorToastProps) {
  return (
    <div className="flex items-center gap-4 pl-4">
      <Image
        src="/utilityImages/errorOne.svg"
        width={40}
        height={40}
        alt="error"
      />
      <div className="flex flex-col">
        <p className="text-[16px] font-bold uppercase">Error</p>
        <p className="text-[12px]">{message}</p>
      </div>
    </div>
  );
}
