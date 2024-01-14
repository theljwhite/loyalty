import React, { useState, useEffect } from "react";
import {
  MIN_TIER_NAME_LENGTH,
  MAX_TIER_NAME_LENGTH,
  MIN_TIER_POINTS_REQ_VALUE,
  MAX_TIERS_LENGTH,
} from "~/constants/loyaltyConstants";
import {
  InfoIcon,
  FormErrorIcon,
  RightChevron,
  ChecklistIcon,
} from "../UI/Dashboard/Icons";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { validateTierInputs } from "~/utils/loyaltyValidation";
import { Tier } from "~/customHooks/useDeployLoyalty/types";

//TODO - this can prob be refactored to eliminate the need for additional state variables,
//and to eliminate the useEffect that is used here.
//TODO - needs styling fixes

interface TiersEditorProps {
  activeTier: number;
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateTiersEditor({
  activeTier,
  setIsEditorOpen,
}: TiersEditorProps) {
  const [isObjectivesDropdownOpen, setIsObjectivesDropdownOpen] =
    useState<boolean>(false);
  const [tierName, setTierName] = useState<string>("");
  const [pointsRequired, setPointsRequired] = useState<string>("");
  const [minObjsToReachTier, setMinObjsToReachTier] = useState<string>("0");
  const [inputError, setInputError] = useState<{
    isError: boolean;
    message: string;
  }>({
    isError: false,
    message: "",
  });

  const { tiers, setTiers, objectives } = useDeployLoyaltyStore();

  const isNewTier = activeTier == tiers.length;
  const maxReachablePoints = objectives.reduce(
    (prev, { reward }) => prev + reward,
    0,
  );

  useEffect(() => {
    if (!isNewTier) {
      const existingTier = tiers.find((tier) => tier.id == activeTier);
      if (existingTier) {
        setTierName(existingTier.name);
        setPointsRequired(String(existingTier.rewardsRequired));
        setMinObjsToReachTier(String(existingTier.minObjsToReach));
      }
    }
  }, []);

  const isValidated = (): boolean => {
    const inputsError = validateTierInputs(
      maxReachablePoints,
      tierName,
      Number(pointsRequired),
    );
    if (inputsError) {
      setInputError({ isError: true, message: inputsError });
      return false;
    }

    if (tiers.length >= MAX_TIERS_LENGTH) {
      setInputError({
        isError: true,
        message: `Exceeded max tiers length: ${MAX_TIERS_LENGTH} `,
      });
      return false;
    }

    const lastTierPoints = tiers[tiers.length - 1]?.rewardsRequired;

    if (lastTierPoints && lastTierPoints >= Number(pointsRequired)) {
      setInputError({
        isError: true,
        message:
          "Tier points required value must be greater than the tier before it",
      });
      return false;
    }

    return true;
  };

  const addNewTier = (): void => {
    if (isValidated()) {
      const newTier: Tier = {
        id: tiers.length,
        name: tierName,
        rewardsRequired: Number(pointsRequired),
        minObjsToReach: Number(minObjsToReachTier),
      };
      const newTiers = [...tiers, newTier].map((tier, index) => ({
        ...tier,
        id: index,
      }));
      setTiers(newTiers);
      setIsEditorOpen(false);
    }
  };

  const editExistingTier = (): void => {
    if (!isNewTier && isValidated()) {
      const updatedValues: Partial<Tier> = {
        name: tierName,
        rewardsRequired: Number(pointsRequired),
        minObjsToReach: Number(minObjsToReachTier),
      };
      const editedTiers = tiers.map((tier) =>
        tier.id == activeTier ? { ...tier, ...updatedValues } : tier,
      );
      setTiers(editedTiers);
      setIsEditorOpen(false);
    }
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPointsRequired(e.target.value);
    calculateMinObjectivesToReachTier(Number(e.target.value));
  };

  const calculateMinObjectivesToReachTier = (
    tierPointsRequired: number,
  ): void => {
    const objectivesCopy = [...objectives];
    let objectivesCount: number = 0;
    let totalPoints: number = 0;

    if (tierPointsRequired > maxReachablePoints) {
      setMinObjsToReachTier("Unreachable");
    } else {
      for (const objective of objectivesCopy) {
        totalPoints += objective.reward;
        objectivesCount++;
        if (totalPoints >= tierPointsRequired) break;
      }
      setMinObjsToReachTier(String(objectivesCount));
    }
  };

  return (
    <div className="border-box break-words">
      <div className="max-w-[50em]">
        <div className="flex flex-col">
          <div className="relative w-full">
            <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
              Tier Name
            </label>
            <input
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              minLength={MIN_TIER_NAME_LENGTH}
              maxLength={MAX_TIER_NAME_LENGTH}
              placeholder="e.g Silver"
              className={`${
                inputError.isError && inputError.message.includes("name")
                  ? "ring-2 ring-error-1 focus:ring-primary-1"
                  : "ring-0 focus:ring-2 focus:ring-primary-1"
              } relative h-10 w-full min-w-0 appearance-none rounded-md border-2 border-solid border-transparent bg-dashboard-input p-4 text-base outline-none`}
            />
          </div>
          <div className="relative mt-5 w-full">
            <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
              Points Amount Required to Reach this Tier
            </label>
            <input
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              type="number"
              value={pointsRequired}
              onChange={(e) => handlePointsChange(e)}
              min={MIN_TIER_POINTS_REQ_VALUE}
              max={maxReachablePoints}
              placeholder="e.g 2000"
              className={`${
                inputError.isError && inputError.message.includes("points")
                  ? "ring-2 ring-error-1 focus:ring-primary-1"
                  : "ring-0 focus:ring-2 focus:ring-primary-1"
              } relative h-10 w-full min-w-0 appearance-none rounded-md border-2 border-solid border-transparent bg-dashboard-input p-4 text-base outline-none`}
            />

            <div className="mt-2 flex flex-col gap-4 leading-normal text-dashboard-tooltip">
              <span className="flex flex-row gap-1 break-words">
                *Reaching this points amount will move a user into this tier.{" "}
                <span className="text-primary-1">Learn more</span>
                <InfoIcon size={20} color="currentColor" />
              </span>
              <span className="mt-2 flex flex-row gap-2 break-words">
                <span className="text-primary-1">
                  <ChecklistIcon size={20} color="currentColor" />{" "}
                </span>
                Min. number of objectives completed to reach this tier:{" "}
                {minObjsToReachTier}
              </span>
            </div>
            {/* <hr className="mt-4 w-full border-t border-solid border-dashboard-divider opacity-60" /> */}
          </div>
        </div>

        <div className="mt-5 flex">
          <div className="my-3 w-full">
            <div
              onClick={() =>
                setIsObjectivesDropdownOpen(!isObjectivesDropdownOpen)
              }
              className="border-y border-dashboard-divider"
            >
              <h1>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center overflow-visible py-2 pe-4 ps-4 text-xl font-semibold outline-none hover:bg-dashboard-input"
                >
                  <div className="text-dashboard-header flex-1 text-left">
                    Reference Objectives
                  </div>
                  <span
                    className={
                      isObjectivesDropdownOpen ? "rotate-[-90deg]" : "rotate-90"
                    }
                  >
                    <RightChevron size={20} color="currentColor" />{" "}
                  </span>
                </button>
              </h1>
              {isObjectivesDropdownOpen && (
                <div className="block h-auto">
                  <div className="pb-4 pe-4 ps-4 pt-2">
                    <div className="mt-4 rounded-lg border border-dashboard-menuInner bg-white">
                      <h2 className="flex h-10 w-full items-center justify-between rounded-t-lg border border-b bg-dashboard-input pe-5 ps-5 text-sm font-semibold leading-[1.2] text-dashboard-heading">
                        Your Objectives (sorted by points)
                      </h2>
                      <div
                        style={{ scrollbarWidth: "none" }}
                        className="max-h-[460px] p-5"
                      >
                        <div className="flex flex-col break-words">
                          <div className="relative w-full">
                            {objectives
                              .sort((a, b) => b.reward - a.reward)
                              .map((obj) => {
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="mt-4 w-full border-solid border-[0px_0px_1px] border-dashboard-divider opacity-60" />

        <div className="mt-4 flex flex-row items-center">
          <button
            type="button"
            onClick={() => setIsEditorOpen(false)}
            className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
          >
            Back
          </button>
          <button
            type="button"
            onClick={isNewTier ? addNewTier : editExistingTier}
            className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
          >
            {isNewTier ? "Add" : "Save"}
          </button>
          {inputError.isError && (
            <span className="flex flex-row gap-1 truncate pl-4 font-medium text-error-1">
              <FormErrorIcon size={20} color="currentColor" />{" "}
              {inputError.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
