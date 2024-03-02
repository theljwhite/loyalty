import { useEscrowSettingsStore } from "~/customHooks/useEscrowSettings/store";
import {
  ERC721RewardOrder,
  ERC721RewardCondition,
} from "~/customHooks/useEscrowSettings/types";
import { type Tier, type Objective } from "@prisma/client";
import DashboardModalWrapper from "../../DashboardModalWrapper";

interface ConfirmERC721EscrowProps {
  objectives: Objective[];
  tiers: Tier[];
  setERC721EscrowSettings: () => Promise<void>;
}

export default function ConfirmERC721EscrowSettings({
  objectives,
  tiers,
  setERC721EscrowSettings,
}: ConfirmERC721EscrowProps) {
  const {
    erc721RewardCondition,
    erc721RewardOrder,
    rewardGoal,
    setIsConfirmModalOpen,
  } = useEscrowSettingsStore((state) => state);

  const objectiveRewardCondition =
    erc721RewardCondition === ERC721RewardCondition.ObjectiveCompleted;
  const tierRewardCondition =
    erc721RewardCondition === ERC721RewardCondition.TierReached;

  const rewardOrderAscending =
    erc721RewardOrder === ERC721RewardOrder.Ascending;
  const rewardOrderDescending =
    erc721RewardOrder === ERC721RewardOrder.Descending;

  const ascendingOrderExample: string = Array.from(
    { length: 10 },
    (_, i) => i,
  ).join(",");
  const descendingOrderExample: string = Array.from(
    { length: 10 },
    (_, i) => 10 - i,
  ).join(",");
  const randomOrderExample = "6,3,4,2,5,7,8,0,1,9";

  return (
    <DashboardModalWrapper setIsOpenFunc={setIsConfirmModalOpen}>
      <>
        <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
          <div className="flex items-center justify-between text-dashboard-activeTab">
            Confirm escrow settings
          </div>

          <p className="mt-1 text-sm font-normal leading-5 text-dashboard-lightGray">
            Review and confirm your escrow settings. Then, write your settings
            to your escrow contract.
          </p>
        </header>
        <div className="flex-1 py-0 pe-6 ps-6">
          <div className="relative mt-6 w-full">
            <div className="mb-6 flex w-full">
              <div className="w-full">
                <div className="relative w-full">
                  <div className="flex justify-between">
                    <div className="relative flex">
                      <div className="flex flex-col">
                        <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                          Rewarding tokens in{" "}
                          {ERC721RewardOrder[erc721RewardOrder]} order
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="relative isolate flex w-full">
                    <div className="flex w-full flex-row items-center">
                      <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
                        <div className="flex w-full justify-between">
                          <div className="flex">
                            <p className="overflow-hidden truncate text-sm font-semibold capitalize leading-5 text-white">
                              Example of {ERC721RewardOrder[erc721RewardOrder]}{" "}
                              Reward Order
                            </p>
                          </div>
                          <div className="ml-auto flex gap-1"></div>
                        </div>
                        <div className="relative flex">
                          <section className="relative flex w-full flex-col">
                            <div className="flex max-h-[300px] w-full flex-row text-start">
                              <span className="pr-3" />
                              <span className="text-md text-dashboard-codeLightBlue">
                                {rewardOrderAscending
                                  ? `${ascendingOrderExample}`
                                  : rewardOrderDescending
                                    ? `${descendingOrderExample}`
                                    : `${randomOrderExample}`}
                              </span>
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4 flex w-full">
              <div className="w-full">
                <div className="relative w-full">
                  <div className="flex justify-between">
                    <div className="relative flex">
                      <div className="flex flex-col">
                        <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                          Rewarding tokens via{" "}
                          {ERC721RewardCondition[erc721RewardCondition]} reward
                          condition
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="relative isolate flex w-full">
                    <div className="flex w-full flex-row items-center">
                      <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
                        <div className="flex w-full justify-between">
                          <div className="flex">
                            <p className="overflow-hidden truncate text-sm font-semibold capitalize leading-5 text-white">
                              {ERC721RewardCondition[erc721RewardCondition]}{" "}
                              Reward Condition
                            </p>
                          </div>
                          <div className="ml-auto flex gap-1"></div>
                        </div>
                        <div className="relative flex">
                          <section className="relative flex w-full flex-col">
                            <div className="flex max-h-[300px] w-full flex-row text-start">
                              <span className="pr-3" />
                              <span className="text-md text-dashboard-codeLightBlue">
                                {objectiveRewardCondition
                                  ? `"${objectives[Number(rewardGoal)]?.title}"`
                                  : tierRewardCondition
                                    ? `${tiers[Number(rewardGoal)]?.name}`
                                    : `${rewardGoal} points total`}
                              </span>
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-8 flex items-center justify-between py-0 pe-6 ps-6">
          <div className="flex w-full justify-between">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-transparent py-0 pe-3 ps-3 align-middle font-semibold leading-[1.2] text-primary-1 outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={setERC721EscrowSettings}
              className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 py-0 pe-3 ps-3 align-middle font-semibold leading-[1.2] text-white outline-none disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-gray-400"
            >
              Write Settings
            </button>
          </div>
        </footer>
      </>
    </DashboardModalWrapper>
  );
}
