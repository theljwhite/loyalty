import React, { useState } from "react";
import { RewardType } from "~/customHooks/useDeployLoyalty/types";
import { useNextLoyaltyStep } from "~/customHooks/useNextLoyaltyStep/useNextLoyaltyStep";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import CreateNextButton from "./CreateNextButton";
import { validationFuncs } from "~/utils/loyaltyValidation";
import { RightChevron, FormErrorIcon, InfoIcon } from "../UI/Dashboard/Icons";
import Link from "next/link";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";

//TODO - small styling fixes.
//TODO - add another "learn more" tab to describe Reward Order/customization options?

type RewardConditionLearnItem = {
  id: number;
  escrowRewardType: "ERC20" | "ERC721" | "ERC1155";
  rewardConditions: string[];
};

const rewardConditionLearnItems: RewardConditionLearnItem[] = [
  {
    id: 0,
    escrowRewardType: "ERC20",
    rewardConditions: [
      "All Obj. Complete",
      "All Tiers Complete",
      "Single Obj.",
      "Single Tier",
      "Points Total",
      "Each Obj.",
    ],
  },
  {
    id: 1,
    escrowRewardType: "ERC721",
    rewardConditions: ["Single Obj.", "Single Tier", "Points Total"],
  },
  {
    id: 2,
    escrowRewardType: "ERC1155",
    rewardConditions: [
      "Each Obj.",
      "Single Obj.",
      "Each Tier",
      "Single Tier",
      "Points Total",
    ],
  },
];

export default function CreateRewardType() {
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState<boolean>(false);
  const { rewardType, setRewardType, step, errors } = useDeployLoyaltyStore(
    (state) => state,
  );
  const currentStepError = errors.find((error) => error.step === step);
  const rewardTypeValidation = validationFuncs.get(step);
  const onNextStep = useNextLoyaltyStep([
    () => rewardTypeValidation?.[0]?.validation(rewardType),
  ]);

  return (
    <>
      <div className="mb-6 flex flex-row items-center justify-between text-dashboard-heading">
        <div className="flex min-h-10 items-center">
          <nav className="block">
            <ol className="me-[1em]  list-decimal">
              <li className="inline-flex items-center">
                <span className="cursor-pointer list-decimal items-center hover:underline">
                  Reward Type
                </span>

                <span className="me-1 ms-1 text-dashboard-tooltip">
                  <RightChevron size={16} color="currentColor" />
                </span>
              </li>

              <li className="inline-flex items-center">
                <span className="cursor-pointer list-decimal items-center hover:underline">
                  Select Reward Type
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="border-box break-words">
        <div className="max-w-[50em]">
          <div className="flex flex-col">
            <div className="relative w-full">
              <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
                Choose Reward Type
              </label>
              <select
                onChange={(e) => setRewardType(Number(e.target.value))}
                value={rewardType}
                className="relative h-10 w-full min-w-0 rounded-md border-2 border-solid border-transparent bg-dashboard-input pl-2 text-base outline-none ring-0 focus:ring-2 focus:ring-primary-1"
              >
                <option value={RewardType.Points}>
                  POINTS - (no escrow contract needed, only track points,
                  objectives, tiers)
                </option>
                <option value={RewardType.ERC20}>
                  ERC20 - (will allow an escrow contract to reward ERC20 tokens
                  as users progress)
                </option>
                <option value={RewardType.ERC721}>
                  ERC721 - (will allow an escrow contract to reward ERC721
                  tokens as users progress)
                </option>
                <option value={RewardType.ERC1155}>
                  ERC1155 - (will allow an escrow contract to reward ERC1155
                  tokens as users progress)
                </option>
              </select>

              <div className="mt-2 flex flex-col gap-4 leading-normal text-dashboard-tooltip">
                <span className="flex flex-row gap-1 break-words">
                  *Once your contract is deployed, Reward Type cannot be
                  changed.
                  <span className="text-primary-1">Learn more</span>
                  <InfoIcon size={20} color="currentColor" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h1 className="my-6 text-xl font-semibold text-dashboard-heading">
        Learn more about Reward Type
      </h1>
      <p className="my-4 leading-[1.8] text-dashboard-menuText">
        Reward Type allows an additional escrow contract to be able to be
        deployed that works in sync with your loyalty contract. All Reward Types
        track points, objectives, and tiers on-chain.{" "}
        <span className="bg-transparent text-primary-1">
          <code className="rounded-lg border border-dashboard-codeBorder bg-dashboard-codeBg py-1 pe-1.5 ps-1.5 text-[0.75em]">
            Points
          </code>
        </span>{" "}
        reward type is chosen when there is no need for an additional escrow
        contract.
      </p>
      <p className="my-4 leading-[1.8] text-dashboard-menuText">
        If you desire another reward type such as
        {rewardConditionLearnItems.map((item) => {
          return (
            <span key={item.id} className="bg-transparent text-primary-1">
              {" "}
              <code className="rounded-lg border border-dashboard-codeBorder bg-dashboard-codeBg py-1 pe-1.5 ps-1.5 text-[0.75em]">
                {item.escrowRewardType}
              </code>{" "}
              ,{" "}
            </span>
          );
        })}
        see the ways in which tokens can be awarded as users progress below.
      </p>

      <div className="mt-5 flex">
        <div className="my-3 w-full">
          <div
            onClick={() => setIsLearnMoreOpen(!isLearnMoreOpen)}
            className="border-y border-dashboard-divider"
          >
            <h1>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center overflow-visible py-2 pe-4 ps-4 text-xl font-semibold outline-none hover:bg-dashboard-input"
              >
                <div className="flex-1 text-left text-dashboard-heading">
                  Reward Conditions
                </div>

                <span
                  className={isLearnMoreOpen ? "rotate-[-90deg]" : "rotate-90"}
                >
                  <RightChevron size={20} color="currentColor" />{" "}
                </span>
              </button>
            </h1>

            {isLearnMoreOpen && (
              <>
                <p className="my-4 pe-4 ps-4 text-dashboard-menuText">
                  Reward Conditions in your escrow contract specify how and when
                  tokens are rewarded to users. For example, you can specify a
                  specific objective to be completed in which will reward a
                  token, or a specific tier, specific points total, etc.
                </p>
                <p className="my-4 pe-4 ps-4 text-dashboard-menuText">
                  In other cases, you can reward for each objective or each
                  tier. Each escrow contract can only have 1 reward condition
                  which is set by its creator before it is in issuance. See
                  options for each Reward Type below or{" "}
                  <Link
                    className="text-primary-1 underline"
                    href={ROUTE_DOCS_MAIN}
                  >
                    see docs
                  </Link>{" "}
                  for more info.
                </p>
                <div className="block h-auto">
                  <div className="pb-4 pe-4 ps-4 pt-2">
                    <div className="my-6 block max-w-full overflow-x-auto overflow-y-hidden rounded-lg border border-solid border-dashboard-input bg-white">
                      <table className="w-full break-words">
                        <thead className="border-collapse border-spacing-[2px] border border-dashboard-divider bg-dashboard-input">
                          <tr className="table-row break-words border-none">
                            {rewardConditionLearnItems.map((item) => {
                              return (
                                <th
                                  key={item.id}
                                  className="w-[33%] whitespace-normal border border-r-dashboard-codeBorder pe-4 ps-4 text-center font-semibold capitalize"
                                  scope="col"
                                >
                                  {item.escrowRewardType}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {rewardConditionLearnItems.map((item) => {
                            return (
                              <>
                                <td
                                  key={item.id}
                                  className="max-w-[300px] border border-dashboard-codeBorder py-2 pe-4 ps-4 text-start align-top leading-5"
                                >
                                  {item.rewardConditions?.map(
                                    (condition, index) => {
                                      return (
                                        <p key={index} className="py-1">
                                          {condition}
                                        </p>
                                      );
                                    },
                                  )}
                                </td>
                                <tr className="hidden" />
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <hr className="mt-4 w-full border-solid border-[0px_0px_1px] border-dashboard-divider opacity-60" />
      <div>
        <div className="mt-6 flex flex-row items-center">
          <CreateNextButton step={step} onClick={onNextStep} />
          {currentStepError && (
            <span className="flex flex-row gap-1 truncate pl-4 font-medium text-error-1">
              <FormErrorIcon size={20} color="currentColor" />{" "}
              {currentStepError.message}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
