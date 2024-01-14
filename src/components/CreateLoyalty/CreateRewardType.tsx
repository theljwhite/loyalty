import React from "react";
import { RewardType } from "~/customHooks/useDeployLoyalty/types";
import { useNextLoyaltyStep } from "~/customHooks/useNextLoyaltyStep/useNextLoyaltyStep";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import CreateNextButton from "./CreateNextButton";
import { validationFuncs } from "~/utils/loyaltyValidation";
import { RightChevron, FormErrorIcon, InfoIcon } from "../UI/Dashboard/Icons";

//TODO 1/14 - finish

export default function CreateRewardType() {
  const { rewardType, setRewardType, step, errors } = useDeployLoyaltyStore();
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
