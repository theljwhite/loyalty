import React from "react";

//TODO

interface DashboardAnalyticsStatusProps {
  containerBg: string;
}

export default function DashboardAnalyticsStatus({
  containerBg,
}: DashboardAnalyticsStatusProps) {
  return (
    <div className="flex flex-col">
      <div
        className={`${containerBg} relative flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6`}
      >
        <div className="flex flex-row items-start">
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-base font-semibold leading-6">Analytics</p>
            </div>
            <p className="mb-4 text-[13px] font-normal text-dashboard-lightGray">
              One your loyalty program has users, this area will update with
              analytics info.
            </p>
            <p className="text-dashboard-lightGray">No data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
