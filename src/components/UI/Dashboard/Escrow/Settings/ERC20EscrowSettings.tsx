import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { ERC20RewardCondition } from "~/customHooks/useEscrowSettings/types";
import { useEscrowSettingsStore } from "~/customHooks/useEscrowSettings/store";
import useEscrowSettings from "~/customHooks/useEscrowSettings/useEscrowSettings";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { erc20RewardConditionDescriptors } from "~/constants/contractsInfoHelp";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";
import {
  NUMBERS_OR_FLOATS_ONLY_REGEX,
  NUMBERS_OR_FLOATS_SEPARATED_BY_COMMAS_REGEX,
} from "~/constants/regularExpressions";
import DashboardSelectBox from "../../DashboardSelectBox";
import DashboardActionButton from "../../DashboardActionButton";
import DashboardSingleInputBox from "../../DashboardSingleInputBox";
import RewardGoalSelect from "./RewardGoalSelect";
import ConfirmERC20EscrowSettings from "./ConfirmERC20EscrowSettings";
import { DownChevron, InfoIcon } from "../../Icons";

const rewardConditionOptions = [
  { title: "Choose a reward condition", value: ERC20RewardCondition.NotSet },
  {
    title: "All Objectives Completed",
    value: ERC20RewardCondition.AllObjectivesComplete,
  },
  {
    title: "Single Objective Completed",
    value: ERC20RewardCondition.SingleObjective,
  },
  { title: "All Tiers Reached", value: ERC20RewardCondition.AllTiersComplete },
  { title: "Single Tier Reached", value: ERC20RewardCondition.SingleTier },
  { title: "Specified Points Total", value: ERC20RewardCondition.PointsTotal },
  {
    title: "Reward Each Objective",
    value: ERC20RewardCondition.RewardPerObjective,
  },
  { title: "Reward Each Tier", value: ERC20RewardCondition.RewardPerTier },
];

export default function ERC20EscrowSettings() {
  const [rewardConditionInfo, setRewardConditionInfo] = useState<string>(
    "Select a reward condition to learn more",
  );

  const {
    erc20RewardCondition,
    payoutAmount,
    payoutAmounts,
    areAmountsValid,
    isConfirmModalOpen,
    setERC20RewardCondition,
    setPayoutAmount,
    setPayoutAmounts,
    setAreAmountsValid,
    setIsConfirmModalOpen,
  } = useEscrowSettingsStore((state) => state);

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data } = api.loyaltyPrograms.getOnlyObjectivesAndTiers.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );
  const { data: escrow } =
    api.escrow.getEscrowAndRewardsAddressByLoyalty.useQuery(
      {
        loyaltyAddress: String(loyaltyAddress),
      },
      { refetchOnWindowFocus: false },
    );

  const objectives = data?.objectives ?? [];
  const tiers = data?.tiers ?? [];

  const {
    setERC20EscrowSettingsBasic,
    setERC20EscrowSettingsAdvanced,
    validateERC20PayoutsAndRunEstimate,
    validateERC20SinglePayoutAndEstimate,
  } = useEscrowSettings(escrow?.address ?? "", String(loyaltyAddress));

  const handleSetERC20EscrowSettings = async (): Promise<void> => {
    if (
      erc20RewardCondition === ERC20RewardCondition.RewardPerObjective ||
      erc20RewardCondition === ERC20RewardCondition.RewardPerTier
    ) {
      await setERC20EscrowSettingsAdvanced(escrow?.rewardAddress ?? "");
    } else {
      await setERC20EscrowSettingsBasic(escrow?.rewardAddress ?? "");
    }
  };

  const validateSettingsAndOpenConfirm = async (): Promise<void> => {
    let isValid: boolean = false;
    if (
      erc20RewardCondition === ERC20RewardCondition.RewardPerObjective ||
      erc20RewardCondition === ERC20RewardCondition.RewardPerTier
    ) {
      isValid = await validateERC20PayoutsAndRunEstimate(tiers, objectives);
    } else {
      isValid = await validateERC20SinglePayoutAndEstimate();
    }

    if (isValid) setIsConfirmModalOpen(true);
  };

  const handlePayoutAmountsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const payoutsString = e.target.value;
    setPayoutAmounts(payoutsString);
    validatePayoutAmountsInput(payoutsString);
  };

  const handleSinglePayoutAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setPayoutAmount(e.target.value);
    validatePayoutAmountInput(e.target.value);
  };

  const validatePayoutAmountsInput = (payoutsString: string): void => {
    if (!NUMBERS_OR_FLOATS_SEPARATED_BY_COMMAS_REGEX.test(payoutsString)) {
      setAreAmountsValid(false);
    } else {
      setAreAmountsValid(true);
    }
  };

  const validatePayoutAmountInput = (payoutString: string): void => {
    if (!NUMBERS_OR_FLOATS_ONLY_REGEX.test(payoutString)) {
      setAreAmountsValid(false);
    } else {
      setAreAmountsValid(true);
    }
  };

  const onRewardConditionSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const rewardConditionEnumVal = Number(e.target.value);
    const [conditionInfo] = erc20RewardConditionDescriptors.filter(
      (desc) => desc.erc20RewardCondition === rewardConditionEnumVal,
    );

    if (conditionInfo) setRewardConditionInfo(conditionInfo.info);
    setERC20RewardCondition(rewardConditionEnumVal);
  };

  return (
    <>
      {isConfirmModalOpen && (
        <ConfirmERC20EscrowSettings
          objectives={objectives}
          tiers={tiers}
          setERC20EscrowSettings={handleSetERC20EscrowSettings}
        />
      )}
      <div className="space-y-8">
        <DashboardSelectBox
          title="ERC20 Reward Condition"
          description="The condition that will reward users as they progress throughout your loyalty program."
          descriptionTwo="Do you want to reward a specific objective, tier, or points total? Every objective or tier? Once written to your escrow contract, this setting cannot be reversed."
          selections={[]}
          isRequiredField
          customSelect={
            <div className="flex w-full flex-col">
              <div className="mb-1 flex flex-row items-center justify-between">
                <label className="mb-1 text-sm font-semibold leading-5">
                  Select a Reward Condition
                </label>
              </div>
              <p className="mb-4 text-[13px] font-normal leading-[1.125rem] text-dashboard-lightGray">
                The condition that will reward a token as users progress through
                your loyalty program
              </p>

              <div className="mb-[0.5em]">
                <div className="relative w-full">
                  <select
                    onChange={onRewardConditionSelect}
                    className="relative h-8 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                  >
                    {rewardConditionOptions.map((option, index) => {
                      return (
                        <option
                          key={index}
                          value={option.value}
                          className="block min-w-[1.2em] whitespace-nowrap bg-white px-0.5 font-normal"
                        >
                          {option.title}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-none top-half absolute right-0.5 inline-flex h-full w-6 translate-y-[-2/4] items-center justify-center text-xl text-dashboard-lightGray">
                    <div className="h-[1em] w-[1em]">
                      <DownChevron size={20} color="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="mt-4 text-[13px] leading-normal text-dashboard-lightGray">
                    <span className="flex flex-row gap-2 break-words">
                      <span className="h-4 w-4">
                        <InfoIcon size={18} color="currentColor" />
                      </span>
                      {rewardConditionInfo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }
        />
        {(erc20RewardCondition === ERC20RewardCondition.SingleObjective ||
          erc20RewardCondition === ERC20RewardCondition.SingleTier ||
          erc20RewardCondition === ERC20RewardCondition.PointsTotal) && (
          <RewardGoalSelect />
        )}
        {(erc20RewardCondition === ERC20RewardCondition.RewardPerObjective ||
          erc20RewardCondition === ERC20RewardCondition.RewardPerTier) && (
          <DashboardSingleInputBox
            title="ERC20 Amounts to Reward"
            description={
              erc20RewardCondition === ERC20RewardCondition.RewardPerTier
                ? `For each tier, enter the desired ERC20 amounts you would like to payout per user reaching the tier. Separate amounts by commas. Since your program has ${tiers.length} tiers, you should have ${tiers.length} amounts.`
                : `Enter the amount that each user should be rewarded per each objective being completed. Separate amounts by commas. Since your program has ${objectives.length} objectives, you should have ${objectives.length} amounts.`
            }
            stateVar={payoutAmounts}
            isValid={areAmountsValid}
            disableCondition={false}
            onChange={handlePayoutAmountsChange}
            isRequiredField
            placeholder="ie: 0.5,1.0,2.0,4.0"
          />
        )}
        {(erc20RewardCondition === ERC20RewardCondition.AllObjectivesComplete ||
          erc20RewardCondition === ERC20RewardCondition.AllTiersComplete ||
          erc20RewardCondition === ERC20RewardCondition.SingleObjective ||
          erc20RewardCondition === ERC20RewardCondition.SingleTier ||
          erc20RewardCondition === ERC20RewardCondition.PointsTotal) && (
          <DashboardSingleInputBox
            title="ERC20 Amount to Reward"
            description="Enter ERC20 amount to reward each user who satisfies the reward condition"
            stateVar={payoutAmount}
            isValid={areAmountsValid}
            disableCondition={false}
            onChange={handleSinglePayoutAmountChange}
            isRequiredField
            placeholder="ie: 0.5"
          />
        )}
        <div className="mt-6 flex flex-row items-center justify-between">
          <DashboardActionButton
            btnText="Learn more first"
            linkPath={ROUTE_DOCS_MAIN}
            isPrimary={false}
          />

          <DashboardActionButton
            btnText={
              isConnected && address ? "Finalize Settings" : "Connect wallet"
            }
            btnType="button"
            isPrimary={true}
            onClick={
              isConnected && address
                ? validateSettingsAndOpenConfirm
                : openConnectModal
            }
            disableCondition={isConnected && address ? !areAmountsValid : false}
          />
        </div>
      </div>
    </>
  );
}
