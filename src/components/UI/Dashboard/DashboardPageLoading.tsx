import React from "react";
import { DashboardLoadingSpinner } from "../Misc/Spinners";

export default function DashboardPageLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <DashboardLoadingSpinner size={48} />
      </div>
    </div>
  );
}
