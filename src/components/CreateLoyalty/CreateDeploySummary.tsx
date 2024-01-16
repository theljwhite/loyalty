import React from "react";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { RightChevron } from "../UI/Dashboard/Icons";
import { rewardTypeNumToPrismaEnum } from "~/utils/rewardTypeNumToPrismaEnum";

//TODO - make tables a reusuable component so there's less code

interface CreateDeploySummaryProps {
  isSummaryOpen: boolean;
}

export default function CreateDeploySummary({
  isSummaryOpen,
}: CreateDeploySummaryProps) {
  const { name, objectives, tiers, rewardType, programEndsAt } =
    useDeployLoyaltyStore();

  return (
    <>
      <h1>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center overflow-visible py-2 pe-4 ps-4 text-xl font-semibold outline-none hover:bg-dashboard-input"
        >
          <div className="text-dashboard-header flex-1 text-left">
            Program Summary
          </div>
          <span className={isSummaryOpen ? "rotate-[-90deg]" : "rotate-90"}>
            <RightChevron size={20} color="currentColor" />{" "}
          </span>
        </button>
      </h1>
      {isSummaryOpen && (
        <div className="block h-auto">
          <div className="pb-4 pe-4 ps-4 pt-2">
            <h1 className="mb-2 mt-4 text-2xl text-dashboard-heading">
              {name}
            </h1>
            <p className="mb-8 text-dashboard-tooltip">
              Ending on {programEndsAt.toLocaleDateString()} at{" "}
              {programEndsAt.toLocaleTimeString()}
            </p>
            <div className="mb-12 flex flex-row">
              <div className="pr-12">
                <div className="relative">
                  <dl>
                    <dt className="font-medium text-dashboard-menuText">
                      Reward Type
                    </dt>
                    <div className="max-w-[8em]">
                      <dd className="align-baseline text-2xl">
                        {rewardTypeNumToPrismaEnum(rewardType)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="me-5 ms-5 h-auto w-auto border-l border-dashboard-menuInner" />

              <div className="relative">
                <dl>
                  <dt className="font-medium text-dashboard-menuText">
                    Objectives
                  </dt>
                  <div className="max-w-[8em]">
                    <dd className="align-baseline text-2xl">
                      {objectives.length}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mb-12 mt-4 rounded-lg border border-dashboard-menuInner bg-white">
              <h2 className="flex h-10 w-full items-center justify-between rounded-t-lg border border-b bg-dashboard-input pe-5 ps-5 text-sm font-semibold leading-[1.2] text-dashboard-heading">
                {name} Objectives
              </h2>
              <div
                style={{ scrollbarWidth: "none" }}
                className="max-h-[460px] p-5"
              >
                <div className="flex flex-col break-words">
                  <div className="relative w-full">
                    {objectives.map((obj) => {
                      return (
                        <div
                          key={obj.id}
                          className="flex flex-row items-center gap-2 py-2"
                        >
                          <input
                            placeholder={obj.title}
                            className="text-md relative h-10 w-full appearance-none rounded-md border-2 border-transparent bg-dashboard-input pe-4 ps-4 outline-none"
                            disabled={true}
                          />
                          <input
                            placeholder={`Worth ${obj.reward} points`}
                            className="text-md relative h-10 w-full appearance-none rounded-md border-2 border-transparent bg-dashboard-input pe-4 ps-4 outline-none"
                            disabled={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-dashboard-menuInner bg-white">
              <h2 className="flex h-10 w-full items-center justify-between rounded-t-lg border border-b bg-dashboard-input pe-5 ps-5 text-sm font-semibold leading-[1.2] text-dashboard-heading">
                {name} Tiers
              </h2>
              <div
                style={{ scrollbarWidth: "none" }}
                className="max-h-[460px] p-5"
              >
                <div className="flex flex-col break-words">
                  <div className="relative w-full">
                    {tiers.map((tier) => {
                      return (
                        <div
                          key={tier.id}
                          className="flex flex-row items-center gap-2 py-2"
                        >
                          <input
                            placeholder={tier.name}
                            className="text-md relative h-10 w-full appearance-none rounded-md border-2 border-transparent bg-dashboard-input pe-4 ps-4 outline-none"
                            disabled={true}
                          />
                          <input
                            placeholder={`${tier.rewardsRequired} points required`}
                            className="text-md relative h-10 w-full appearance-none rounded-md border-2 border-transparent bg-dashboard-input pe-4 ps-4 outline-none"
                            disabled={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
