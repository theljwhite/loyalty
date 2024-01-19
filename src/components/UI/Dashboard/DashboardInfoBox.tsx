import React from "react";
import Image from "next/image";
import { WarningIcon, FormErrorIcon, InfoIcon } from "./Icons";

interface DashboardInfoBoxProps {
  info: string;
  infoType: string;
  outlink?: string;
  outlinkText?: string;
}

export default function DashboardInfoBox({
  info,
  infoType,
  outlink,
  outlinkText,
}: DashboardInfoBoxProps) {
  const accentColor: string =
    infoType === "warn"
      ? "text-warn-1"
      : infoType === "error"
        ? "text-error-1"
        : infoType === "success"
          ? "text-success-1"
          : "text-blue-800";

  return (
    <div
      className={`${accentColor} my-6 flex items-center justify-center gap-4 rounded-md border-l-4 border-current bg-dashboard-codeBg py-4 pe-6 ps-6`}
    >
      <div
        className={`${accentColor} relative inline-block h-5 w-5 shrink-0 leading-[1em]`}
      >
        {infoType === "warn" ? (
          <WarningIcon size={20} color="currentColor" />
        ) : infoType === "error" ? (
          <FormErrorIcon size={20} color="currentColor" />
        ) : infoType === "success" ? (
          <Image
            width={20}
            height={20}
            alt="checkmark"
            src="/utilityImages/checkmarkOne.svg"
          />
        ) : (
          <InfoIcon size={20} color="currentColor" />
        )}
      </div>
      <div className="w-full">
        <div className="flex flex-col gap-4">
          <p className="leading-6 text-black">
            {info}{" "}
            {outlink && outlinkText && (
              <a className="text-primary-1 underline" href={outlink}>
                {outlinkText}
              </a>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
