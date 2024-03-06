import { useState } from "react";
import { type Objective, type Tier } from "@prisma/client";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import DashboardSummaryTable from "../../DashboardSummaryTable";
import DashboardActionButton from "../../DashboardActionButton";

interface ObjAndTiersPrevProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  objectives: Objective[];
  tiers: Tier[];
}

export default function ObjectivesAndTiersPreview({
  setIsOpen,
  objectives,
  tiers,
}: ObjAndTiersPrevProps) {
  const [showObjectives, setShowObjectives] = useState<boolean>(true);

  return (
    <DashboardModalWrapper setIsModalOpen={setIsOpen}>
      <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
        <div className="flex items-center justify-between text-dashboard-activeTab">
          Review your loyalty program details
        </div>
        <p className="mt-1 text-sm font-normal leading-5 text-dashboard-lightGray">
          Review your objectives or tiers to help you decide your reward
          goal(s).
        </p>
      </header>
      <div className="flex-1 py-0 pe-6 ps-6">
        <div className="flex flex-row gap-2">
          <p
            onClick={() => setShowObjectives(true)}
            className={`${
              showObjectives && "underline"
            } mt-1 cursor-pointer text-sm font-normal leading-5 text-primary-1 hover:opacity-65`}
          >
            Show Objectives
          </p>
          <p
            onClick={() => setShowObjectives(false)}
            className={`${
              !showObjectives && "underline"
            } mt-1 cursor-pointer text-sm font-normal leading-5 text-primary-1 hover:opacity-65`}
          >
            Show Tiers
          </p>
        </div>
        {showObjectives ? (
          <DashboardSummaryTable
            title="Loyalty Program Objectives"
            dataArr={objectives}
            arrProperty1={(obj) => obj.title}
            arrProperty2={(obj) => String(obj.reward)}
          />
        ) : (
          <DashboardSummaryTable
            title="Loyalty Program Tiers"
            dataArr={tiers}
            arrProperty1={(tier) => tier.name}
            arrProperty2={(tier) => String(tier.rewardsRequired)}
          />
        )}
        <footer className="mt-8 flex items-center justify-between py-0 pe-6 ps-6">
          <div className="flex w-full justify-between">
            <DashboardActionButton
              isPrimary={false}
              btnText="Close"
              onClick={() => setIsOpen(false)}
            />
            <DashboardActionButton
              isPrimary
              btnText="Continue"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </footer>
      </div>
    </DashboardModalWrapper>
  );
}
