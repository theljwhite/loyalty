import React from "react";
import DashboardInfoBox from "./DashboardInfoBox";

interface DashboardPageErrorProps {
  message?: string;
}

export default function DashboardPageError({
  message,
}: DashboardPageErrorProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <DashboardInfoBox
          infoType="error"
          info={message ?? "Error. Page does not exist"}
        />
      </div>
    </div>
  );
}
