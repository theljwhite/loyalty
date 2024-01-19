import React from "react";
import { WarningIcon, FormErrorIcon, InfoIcon } from "./Icons";

interface DashboardInfoBoxProps {
  info: string;
  infoType: string;
}

export default function DashboardInfoBox({
  info,
  infoType,
}: DashboardInfoBoxProps) {
  const accentColor: string =
    infoType === "warn"
      ? "text-warn-1"
      : infoType === "error"
        ? "text-error-1"
        : "text-blue-600";

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
        ) : (
          <InfoIcon size={20} color="currentColor" />
        )}
      </div>
      <div className="w-full">
        <div className="flex flex-col gap-4">
          <p className="leading-6 text-black">{info}</p>
        </div>
      </div>
    </div>
  );
}
