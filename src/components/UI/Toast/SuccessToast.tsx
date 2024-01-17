import React from "react";
import Image from "next/image";

interface SuccessToastProps {
  message: string;
}

export default function SuccessToast({ message }: SuccessToastProps) {
  return (
    <div className="flex items-center gap-4 pl-4">
      <Image
        src="/utilityImages/checkmarkOne.svg"
        width={40}
        height={40}
        alt="success"
      />
      <div className="flex flex-col">
        <p className="text-[16px] font-bold uppercase">Success!</p>
        <p className="text-[12px]">{message}</p>
      </div>
    </div>
  );
}
