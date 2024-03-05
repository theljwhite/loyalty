import { type Objective, type Tier } from "@prisma/client";
import { useEscrowSettingsStore } from "~/customHooks/useEscrowSettings/store";
import { ERC1155RewardCondition } from "~/customHooks/useEscrowSettings/types";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import DashboardSummaryTable from "../../DashboardSummaryTable";

//TODO 3/4 unfinished

interface ConfirmERC1155EscrowProps {
  objectives: Objective[];
  tiers: Tier[];
  setERC1155EscrowSettings: () => Promise<void>;
}

export default function ConfirmERC1155EscrowSettings({
  objectives,
  tiers,
  setERC1155EscrowSettings,
}: ConfirmERC1155EscrowProps) {
  const {
    erc1155RewardCondition,
    payoutAmounts,
    payoutAmount,
    rewardTokenIds,
    rewardTokenId,
    rewardGoal,
    setIsConfirmModalOpen,
  } = useEscrowSettingsStore((state) => state);

  const isSingleGoalCondition =
    erc1155RewardCondition === ERC1155RewardCondition.SingleObjective ||
    erc1155RewardCondition === ERC1155RewardCondition.SingleTier ||
    erc1155RewardCondition === ERC1155RewardCondition.PointsTotal;

  const payoutAmountsArr = payoutAmounts.split(",");
  const rewardTokenIdsArr = rewardTokenIds.split(",");

  const objectivesWithPayouts = objectives.map((obj, index) => ({
    ...obj,
    amount: `${payoutAmountsArr[index]} token id #${rewardTokenIdsArr[index]}`,
  }));
  const tiersWithPayouts = tiers.map((tier, index) => ({
    ...tier,
    amount:
      index === 0
        ? "N/A"
        : `${payoutAmountsArr[index]} token id #${rewardTokenIdsArr[index]}`,
  }));

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
          {isSingleGoalCondition ? (
            <div className="relative isolate flex w-full">
              <div className="flex w-full flex-row items-center">
                <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
                  <div className="flex w-full justify-between">
                    <div className="flex">
                      <p className="overflow-hidden truncate text-sm font-semibold capitalize leading-5 text-white">
                        {ERC1155RewardCondition[erc1155RewardCondition]} Reward
                        Condition
                      </p>
                    </div>
                    <div className="ml-auto flex gap-1"></div>
                  </div>
                  <div className="relative flex">
                    <section className="relative flex w-full flex-col">
                      <div className="flex max-h-[300px] w-full flex-row text-start">
                        <span className="pr-3" />
                        <span className="text-md text-dashboard-codeLightBlue">
                          {erc1155RewardCondition ===
                          ERC1155RewardCondition.SingleObjective
                            ? `"${objectives[Number(rewardGoal)]?.title}"`
                            : erc1155RewardCondition ===
                                ERC1155RewardCondition.SingleTier
                              ? `${tiers[Number(rewardGoal)]?.name}`
                              : `${rewardGoal} points total`}
                        </span>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative isolate flex w-full">
              <div className="flex w-full flex-row items-center">
                <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
                  <div className="flex w-full justify-between">
                    <div className="flex">
                      <p className="overflow-hidden truncate text-sm font-semibold capitalize leading-5 text-white">
                        Rewarding tokens with{" "}
                        {ERC1155RewardCondition[erc1155RewardCondition]} Reward
                        Condition
                      </p>
                    </div>
                    <div className="ml-auto flex gap-1"></div>
                  </div>
                  <div className="relative flex">
                    <section className="relative flex w-full flex-col">
                      <div className="flex-1 py-0 pe-6 ps-6">
                        {erc1155RewardCondition ===
                        ERC1155RewardCondition.EachObjective ? (
                          <DashboardSummaryTable
                            title="Objectives with Payout Amounts"
                            dataArr={objectivesWithPayouts}
                            arrProperty1={(obj) => obj.title}
                            arrProperty2={(obj) => String(obj.amount)}
                          />
                        ) : (
                          <DashboardSummaryTable
                            title="Tiers with Payout Amounts"
                            dataArr={tiersWithPayouts}
                            arrProperty1={(tier) => tier.name}
                            arrProperty2={(tier) => tier.amount}
                          />
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              onClick={setERC1155EscrowSettings}
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
