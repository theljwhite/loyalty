import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import {
  ERC721RewardCondition,
  ERC721RewardOrder,
} from "~/customHooks/useEscrowSettings/types";
import { useEscrowSettingsStore } from "~/customHooks/useEscrowSettings/store";
import useEscrowSettings from "~/customHooks/useEscrowSettings/useEscrowSettings";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  erc721RewardConditionDescriptors,
  erc721RewardOrderDescriptors,
} from "~/constants/contractsInfoHelp";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";
import DashboardSelectBox from "../../DashboardSelectBox";
import DashboardActionButton from "../../DashboardActionButton";
import ConfirmERC721EscrowSettings from "./ConfirmERC721EscrowSettings";
import RewardGoalSelect from "./RewardGoalSelect";
import { DownChevron, InfoIcon } from "../../Icons";

const rewardConditionOptions = [
  {
    title: "Choose a reward condition",
    value: ERC721RewardCondition.NotSet,
  },
  {
    title: "Single objective completed",
    value: ERC721RewardCondition.ObjectiveCompleted,
  },
  {
    title: "Single tier is reached",
    value: ERC721RewardCondition.TierReached,
  },
  {
    title: "Specified Points Total is reached",
    value: ERC721RewardCondition.PointsTotal,
  },
];

const rewardOrderOptions = [
  { title: "Choose a reward tokens order", value: ERC721RewardOrder.NotSet },
  {
    title: "Ascending - (lowest token ids are rewarded first)",
    value: ERC721RewardOrder.Ascending,
  },
  {
    title: "Descending - (highest token ids are rewarded first)",
    value: ERC721RewardOrder.Descending,
  },
  {
    title: "Random - (tokens are rewarded in random order)",
    value: ERC721RewardOrder.Random,
  },
];

export default function ERC721EscrowSettings() {
  const [rewardConditionInfo, setRewardConditionInfo] = useState<string>(
    "Select a reward condition to learn more",
  );
  const [rewardOrderInfo, setRewardOrderInfo] = useState<string>(
    "Select a reward order to learn more",
  );

  const {
    isConfirmModalOpen,
    setERC721RewardCondition,
    setERC721RewardOrder,
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

  const { setERC721EscrowSettings, validateERC721Settings } = useEscrowSettings(
    escrow?.address ?? "",
    String(loyaltyAddress),
  );

  const validateSettingsAndOpenConfirm = async (): Promise<void> => {
    const isSettingsValid = await validateERC721Settings(
      data?.objectives ?? [],
      data?.tiers ?? [],
    );
    if (isSettingsValid) setIsConfirmModalOpen(true);
  };

  const onRewardConditionSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const rewardConditionEnumVal = Number(e.target.value);
    const [conditionInfo] = erc721RewardConditionDescriptors.filter(
      (desc) => desc.erc721RewardCondition === rewardConditionEnumVal,
    );

    if (conditionInfo) setRewardConditionInfo(conditionInfo.info);
    setERC721RewardCondition(rewardConditionEnumVal);
  };

  const onRewardOrderSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const rewardOrderEnumVal = Number(e.target.value);
    const [orderInfo] = erc721RewardOrderDescriptors.filter(
      (desc) => desc.erc721RewardOrder === rewardOrderEnumVal,
    );

    if (orderInfo) setRewardOrderInfo(orderInfo.info);
    setERC721RewardOrder(rewardOrderEnumVal);
  };

  return (
    <>
      {isConfirmModalOpen && (
        <ConfirmERC721EscrowSettings
          objectives={data?.objectives ?? []}
          tiers={data?.tiers ?? []}
          setERC721EscrowSettings={setERC721EscrowSettings}
        />
      )}
      <div className="space-y-8">
        <DashboardSelectBox
          title="ERC721 Reward Condition"
          description="The condition that will reward users as they progress throughout your loyalty program."
          descriptionTwo="Do you want to reward a specific objective, tier, or points total? Once written to your escrow contract, this setting cannot be reversed."
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
        <DashboardSelectBox
          title="ERC721 Reward Order"
          description="The order in which tokens will be rewarded as users progress throughout your loyalty program."
          descriptionTwo="In what order would you like to reward the tokens that you earlier deposited as rewards? Once written to your escrow contract, this setting cannot be reversed."
          selections={[]}
          isRequiredField
          customSelect={
            <div className="flex w-full flex-col">
              <div className="mb-1 flex flex-row items-center justify-between">
                <label className="mb-1 text-sm font-semibold leading-5">
                  Select a Reward Order
                </label>
              </div>
              <p className="mb-4 text-[13px] font-normal leading-[1.125rem] text-dashboard-lightGray">
                The order in which tokens will be rewarded to users as they
                progress
              </p>

              <div className="mb-[0.5em]">
                <div className="relative w-full">
                  <select
                    onChange={onRewardOrderSelect}
                    className="relative h-8 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                  >
                    {rewardOrderOptions.map((option, index) => {
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
                      {rewardOrderInfo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <RewardGoalSelect />
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
          />
        </div>
      </div>
    </>
  );
}
