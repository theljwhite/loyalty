import { useEscrowSettingsStore } from "~/customHooks/useEscrowSettings/store";
import { type Objective, type Tier } from "@prisma/client";
import { ERC20RewardCondition } from "~/customHooks/useEscrowSettings/types";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import DashboardSummaryTable from "../../DashboardSummaryTable";

//TODO 3-4 unfinished

interface ConfirmERC20SettingsProps {
  objectives: Objective[];
  tiers: Tier[];
  setERC20EscrowSettings: () => Promise<void>;
}

export default function ConfirmERC20EscrowSettings({
  objectives,
  tiers,
  setERC20EscrowSettings,
}: ConfirmERC20SettingsProps) {
  const {
    erc20RewardCondition,
    rewardGoal,
    payoutEstimate,
    payoutAmount,
    payoutAmounts,
    setIsConfirmModalOpen,
  } = useEscrowSettingsStore((state) => state);

  const payoutAmountsArr = payoutAmounts.split(",");
  const objectivesWithPayouts = objectives.map((obj, index) => ({
    ...obj,
    amount: `${payoutAmountsArr[index]} tokens`,
  }));
  const tiersWithPayouts = tiers.map((tier, index) => ({
    ...tier,
    amount: index === 0 ? "N/A" : `${payoutAmountsArr[index]} tokens`,
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
          <div className="relative mt-6 w-full">
            <div className="mb-6 flex w-full">
              <div className="w-full">
                <div className="relative w-full">
                  <div className="flex justify-between">
                    <div className="relative flex">
                      <div className="flex flex-col">
                        <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                          Rewarding tokens with{" "}
                          {ERC20RewardCondition[erc20RewardCondition]} reward
                          condition
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {(erc20RewardCondition === ERC20RewardCondition.RewardPerObjective ||
          erc20RewardCondition === ERC20RewardCondition.RewardPerTier) && (
          <div className="flex-1 py-0 pe-6 ps-6">
            {erc20RewardCondition ===
            ERC20RewardCondition.RewardPerObjective ? (
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
        )}
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
              onClick={setERC20EscrowSettings}
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
