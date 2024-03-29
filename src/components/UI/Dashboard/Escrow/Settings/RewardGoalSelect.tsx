import { useState } from "react";
import { useRouter } from "next/router";
import { useEscrowSettingsStore } from "~/customHooks/useEscrowSettings/store";
import { type EscrowType } from "@prisma/client";
import {
  ERC20RewardCondition,
  ERC721RewardCondition,
  ERC1155RewardCondition,
} from "~/customHooks/useEscrowSettings/types";
import { api } from "~/utils/api";
import { NUMBERS_ONLY_REGEX } from "~/constants/regularExpressions";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import DashboardSummaryTable from "../../DashboardSummaryTable";
import DashboardActionButton from "../../DashboardActionButton";
import DashboardInput from "../../DashboardInput";
import { DownChevron, ReadIcon } from "../../Icons";

//TODO extra- clean this one up some maybe, it's def not my "favorite" component lol.
//ERC20, ERC721, ERC1155 reward goal handling can prob be broken into 3 components for cleaner code.
//but for the first pass, this should work for now.

//TODO - still unfinished for other escrow types (Erc20, erc1155)

export default function RewardGoalSelect() {
  const {
    erc20RewardCondition,
    erc721RewardCondition,
    erc1155RewardCondition,
    rewardGoal,
    isRewardGoalValid,
    setRewardGoal,
    setIsRewardGoalValid,
  } = useEscrowSettingsStore((state) => state);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data } = api.loyaltyPrograms.getOnlyObjectivesAndTiers.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const showObjectivesERC20 =
    erc20RewardCondition === ERC20RewardCondition.SingleObjective;

  const showObjectivesERC721 =
    erc721RewardCondition === ERC721RewardCondition.ObjectiveCompleted;

  const showObjectivesERC1155 =
    erc1155RewardCondition === ERC1155RewardCondition.EachObjective ||
    erc1155RewardCondition === ERC1155RewardCondition.SingleObjective;

  const showTiersERC20 =
    erc20RewardCondition === ERC20RewardCondition.SingleTier;

  const showTiersERC721 =
    erc721RewardCondition === ERC721RewardCondition.TierReached;

  const showTiersERC1155 =
    erc1155RewardCondition === ERC1155RewardCondition.SingleTier;

  const showObjectivesChoices =
    showObjectivesERC20 || showObjectivesERC721 || showObjectivesERC1155;
  const showTiersChoices =
    showTiersERC20 || showTiersERC721 || showTiersERC1155;

  const handleRewardGoalSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setRewardGoal(e.target.value);
  };

  const validateSingleRewardGoalInput = (rewardGoal: string): void => {
    if (NUMBERS_ONLY_REGEX.test(rewardGoal) && rewardGoal.charAt(0) !== "0") {
      setIsRewardGoalValid(true);
    } else setIsRewardGoalValid(false);
  };

  const handleSingleRewardGoalInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setRewardGoal(e.target.value);
    validateSingleRewardGoalInput(e.target.value);
  };

  return (
    <>
      <div className="relative flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6">
        <div className="flex flex-row items-start">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between break-words">
              <p className="text-md font-semibold leading-6">
                Select Reward Goal{" "}
                <code className="ml-1 inline-flex items-center gap-1 whitespace-nowrap bg-dashboard-badge py-0.5 pe-1.5 ps-1.5 align-middle text-xs font-normal leading-[1.4] text-dashboard-required">
                  Required
                </code>
              </p>
            </div>
            <p className="mb-4 text-sm font-normal leading-[1.125rem] text-dashboard-lightGray">
              Select a reward goal based on the reward condition in which you
              have applied.
            </p>

            <div>
              <div className="my-6 h-px w-full bg-black opacity-15" />
              <p className="mb-2 text-sm font-semibold leading-5">
                {showObjectivesChoices
                  ? "Select an Objective"
                  : showTiersChoices
                    ? "Select a Tier"
                    : "Enter Points Goal"}
              </p>
              <p className="mb-4 text-[13px] font-normal leading-[1.125rem] text-dashboard-lightGray">
                Specify the{" "}
                {showObjectivesChoices
                  ? "objective"
                  : showTiersChoices
                    ? "tier"
                    : "points total value"}{" "}
                that will reward a token once completed
              </p>
              <div>
                {showObjectivesChoices && (
                  <div className="mb-[0.5em]">
                    <div className="relative w-full">
                      <select
                        onChange={handleRewardGoalSelect}
                        className="relative h-8 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                      >
                        {data?.objectives.map((obj, index) => {
                          return (
                            <option
                              key={index}
                              value={obj.indexInContract}
                              className="block min-w-[1.2em] whitespace-nowrap bg-white px-0.5 font-normal"
                            >
                              {obj.title}
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
                  </div>
                )}
                {showTiersChoices && (
                  <div className="mb-[0.5em]">
                    <div className="relative w-full">
                      <select
                        onChange={handleRewardGoalSelect}
                        className="relative h-8 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                      >
                        {data?.tiers.slice(1).map((tier, index) => {
                          return (
                            <option
                              key={index}
                              value={tier.indexInContract}
                              className="block min-w-[1.2em] whitespace-nowrap bg-white px-0.5 font-normal"
                            >
                              {tier.name}
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
                  </div>
                )}
                {!showObjectivesChoices && !showTiersChoices && (
                  <DashboardInput
                    id="single-reward-goal-entry"
                    stateVar={rewardGoal}
                    onChange={(e) => handleSingleRewardGoalInput(e)}
                    placeholder="Enter reward goal"
                    isValid={isRewardGoalValid}
                    disableCondition={false}
                    disableCorrection
                  />
                )}
                <div></div>
                <label></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
