import React from "react";
import Link from "next/link";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";
import { ReadIcon, WarningIcon } from "~/components/UI/Dashboard/Icons";

interface DashboardInfoBannerProps {
  infoType: string;
  info: string;
  path?: string;
  pathName?: string;
}

export default function DashboardInfoBanner({
  infoType,
  info,
  path,
  pathName,
}: DashboardInfoBannerProps) {
  const bgColorClass: string =
    infoType == "warn" ? "bg-warn-2" : "bg-neutral-2";
  const iconColorClass: string =
    infoType == "warn" ? "text-warn-3" : "text-neutral-3";
  const borderClasses: string =
    infoType == "warn" ? "border border-warn-3" : "border-none";

  return (
    <div
      className={`${bgColorClass} ${borderClasses} mb-8 flex items-start gap-[0.5rem] rounded-md p-3 text-sm font-[0.8125rem] leading-[1.125rem] text-dashboard-lightGray`}
    >
      <span className={iconColorClass}>
        {infoType == "warn" ? (
          <WarningIcon size={16} color="currentColor" />
        ) : (
          <ReadIcon size={14} color="currentColor" />
        )}
      </span>
      <div className="break-word inline-block">
        {info}{" "}
        <Link
          href={path ?? ROUTE_DOCS_MAIN}
          className="cursor-pointer text-primary-1"
        >
          {path && pathName ? pathName : "View docs"}
        </Link>
      </div>
    </div>
  );
}
