import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { ERC1155RewardCondition } from "~/customHooks/useEscrowSettings/types";
import { useEscrowSettingsStore } from "~/customHooks/useEscrowSettings/store";
import useEscrowSettings from "~/customHooks/useEscrowSettings/useEscrowSettings";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { erc1155RewardConditionDescriptors } from "~/constants/contractsInfoHelp";
import {
  NUMBERS_ONLY_REGEX,
  NUMBERS_SEPARATED_BY_COMMAS_REGEX,
} from "~/constants/regularExpressions";
import DashboardSelectBox from "../../DashboardSelectBox";
import DashboardActionButton from "../../DashboardActionButton";
import DashboardSingleInputBox from "../../DashboardSingleInputBox";
import RewardGoalSelect from "./RewardGoalSelect";
import ConfirmERC1155EscrowSettings from "./ConfirmERC1155EscrowSettings";
import ObjectivesAndTiersPreview from "./ObjectivesAndTiersPreview";
import ReviewBalances from "./ReviewBalances";
import { DownChevron, InfoIcon } from "../../Icons";

const rewardConditionOptions = [
  { title: "Choose a reward condition", value: ERC1155RewardCondition.NotSet },
  {
    title: "Reward Each Objective",
    value: ERC1155RewardCondition.EachObjective,
  },
  {
    title: "Single Objective Completed",
    value: ERC1155RewardCondition.SingleObjective,
  },
  { title: "Reward Each Tier", value: ERC1155RewardCondition.EachTier },
  { title: "Single Tier Reached", value: ERC1155RewardCondition.SingleTier },
  {
    title: "Specified Points Total",
    value: ERC1155RewardCondition.PointsTotal,
  },
];

export default function ERC1155EscrowSettings() {
  const [rewardConditionInfo, setRewardConditionInfo] = useState<string>(
    "Select a reward condition to learn more",
  );
  const [isReviewObjectivesOpen, setIsReviewObjectivesOpen] =
    useState<boolean>(false);
  const [isReviewBalancesOpen, setIsReviewBalancesOpen] =
    useState<boolean>(false);

  const {
    erc1155RewardCondition,
    rewardTokenId,
    rewardTokenIds,
    payoutAmount,
    payoutAmounts,
    areAmountsValid,
    areTokensValid,
    isConfirmModalOpen,
    setERC1155RewardCondition,
    setPayoutAmount,
    setPayoutAmounts,
    setAreAmountsValid,
    setRewardTokenId,
    setRewardTokenIds,
    setAreTokensValid,
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
  const { data: escrowAddress } =
    api.loyaltyPrograms.getOnlyEscrowAddressByLoyaltyAddress.useQuery(
      { loyaltyAddress: String(loyaltyAddress) },
      { refetchOnWindowFocus: false },
    );

  const objectives = data?.objectives ?? [];
  const tiers = data?.tiers ?? [];

  const {
    setERC1155EscrowSettingsBasic,
    setERC1155EscrowSettingsAdvanced,
    validateERC1155Basic,
    validateERC1155Advanced,
  } = useEscrowSettings(escrowAddress ?? "", String(loyaltyAddress));

  const isSingleGoalCondition =
    erc1155RewardCondition === ERC1155RewardCondition.SingleObjective ||
    erc1155RewardCondition === ERC1155RewardCondition.SingleTier ||
    erc1155RewardCondition === ERC1155RewardCondition.PointsTotal;

  const validateSettingsAndOpenConfirm = async (): Promise<void> => {
    let isValid: boolean = false;
    if (isSingleGoalCondition) isValid = await validateERC1155Basic();
    else isValid = await validateERC1155Advanced(objectives, tiers);

    if (isValid) setIsConfirmModalOpen(true);
  };

  const handleSetERC1155EscrowSettings = async (): Promise<void> => {
    if (isSingleGoalCondition) await setERC1155EscrowSettingsBasic();
    else await setERC1155EscrowSettingsAdvanced();
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

  const handleSingleTokenIdChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setRewardTokenId(e.target.value);
    validateTokenIdChange(e.target.value);
  };

  const handleMultiTokenIdChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setRewardTokenIds(e.target.value);
    validateMultiTokenIdChange(e.target.value);
  };

  const validateTokenIdChange = (tokenIdString: string): void => {
    if (!NUMBERS_ONLY_REGEX.test(tokenIdString)) setAreTokensValid(false);
    else setAreTokensValid(true);
  };

  const validateMultiTokenIdChange = (tokenIdsString: string): void => {
    if (!NUMBERS_SEPARATED_BY_COMMAS_REGEX.test(tokenIdsString)) {
      setAreTokensValid(false);
    } else {
      setAreTokensValid(true);
    }
  };

  const validatePayoutAmountsInput = (payoutsString: string): void => {
    if (!NUMBERS_SEPARATED_BY_COMMAS_REGEX.test(payoutsString)) {
      setAreAmountsValid(false);
    } else {
      setAreAmountsValid(true);
    }
  };

  const validatePayoutAmountInput = (payoutString: string): void => {
    if (!NUMBERS_ONLY_REGEX.test(payoutString)) {
      setAreAmountsValid(false);
    } else {
      setAreAmountsValid(true);
    }
  };

  const onRewardConditionSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const rewardConditionEnumVal = Number(e.target.value);
    const [conditionInfo] = erc1155RewardConditionDescriptors.filter(
      (desc) => desc.erc1155RewardCondition === rewardConditionEnumVal,
    );

    if (conditionInfo) setRewardConditionInfo(conditionInfo.info);
    setERC1155RewardCondition(rewardConditionEnumVal);
  };

  return (
    <>
     
        {isConfirmModalOpen && (
          <ConfirmERC1155EscrowSettings
            objectives={objectives}
            tiers={tiers}
            setERC1155EscrowSettings={handleSetERC1155EscrowSettings}
          />
        )}
    
      <div className="space-y-8">
        <DashboardSelectBox
          title="ERC1155 Reward Condition"
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
        {isSingleGoalCondition && (
          <>
            <RewardGoalSelect />
            <DashboardSingleInputBox
              title="Token Id To Reward"
              description="Enter the token id that you wish to reward when the reward condition is satisfied. Token id must be a valid token in your escrow contract's balance"
              stateVar={rewardTokenId}
              isValid={areTokensValid}
              disableCondition={false}
              onChange={handleSingleTokenIdChange}
              isRequiredField
              placeholder="ie: 1093"
            />
            <DashboardSingleInputBox
              title="Amount To Reward"
              description="Enter the amount of the token id to reward when the reward condition is satisfied"
              stateVar={payoutAmount}
              isValid={areAmountsValid}
              disableCondition={false}
              onChange={handleSinglePayoutAmountChange}
              isRequiredField
              placeholder="ie: 2"
            />
          </>
        )}

        {(erc1155RewardCondition === ERC1155RewardCondition.EachObjective ||
          erc1155RewardCondition === ERC1155RewardCondition.EachTier) && (
          <>
            <DashboardSingleInputBox
              title="Token Ids to Reward"
              description={
                erc1155RewardCondition === ERC1155RewardCondition.EachTier
                  ? `Enter the token ids that you would like to reward for each tier. Since your program has ${tiers.length} tiers, you should have ${tiers.length} token id entries. You can reward amounts of the same token id for multiple tiers if you want. Separate token ids by commas.`
                  : `Enter the token ids that you would like to reward for each objective. Since your program has ${objectives.length} objectives, you should have ${objectives.length} token id entries. You can reward amounts of the same token id for multiple objectives if you want.`
              }
              stateVar={rewardTokenIds}
              isValid={areTokensValid}
              disableCondition={false}
              onChange={handleMultiTokenIdChange}
              isRequiredField
              placeholder="ie: 1034,1035,1034,100"
            />
            <DashboardSingleInputBox
              title="Amount of Tokens to Reward"
              description={
                erc1155RewardCondition === ERC1155RewardCondition.EachTier
                  ? `For each tier, enter the desired token amounts you would like to payout per user reaching the tier. Separate amounts by commas. Since your program has ${tiers.length} tiers, you should have ${tiers.length} amounts.`
                  : `Enter the amount that each user should be rewarded per each objective being completed. Separate amounts by commas. Since your program has ${objectives.length} objectives, you should have ${objectives.length} amounts.`
              }
              stateVar={payoutAmounts}
              isValid={areAmountsValid}
              disableCondition={false}
              onChange={handlePayoutAmountsChange}
              isRequiredField
              placeholder="ie: 1,3,4,5"
            />
          </>
        )}

        <div className="mt-6 flex flex-row items-center justify-between">
          <div className="flex flex-row gap-2">
            <DashboardActionButton
              btnText="Review Objectives/Tiers"
              onClick={() => setIsReviewObjectivesOpen(true)}
              isPrimary={false}
            />
            <DashboardActionButton
              btnText="Review Balances"
              onClick={() => setIsReviewBalancesOpen(true)}
              isPrimary={false}
            />
          </div>
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
      {isReviewObjectivesOpen && (
        <ObjectivesAndTiersPreview
          objectives={objectives}
          tiers={tiers}
          setIsOpen={setIsReviewObjectivesOpen}
        />
      )}
      {isReviewBalancesOpen && (
        <ReviewBalances
          setIsOpen={setIsReviewBalancesOpen}
          escrowAddress={escrowAddress ?? ""}
          escrowType="ERC1155"
        />
      )}
    </>
  );
}
