import React, { useState, useEffect } from "react";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { InfoIcon, FormErrorIcon } from "../UI/Dashboard/Icons";
import {
  MAX_OBJECTIVE_TITLE_LENGTH,
  MIN_OBJECTIVE_TITLE_LENGTH,
  MIN_OBJECTIVE_POINTS_VALUE,
  MAX_OBJECTIVE_POINTS_VALUE,
  MAX_OBJECTIVES_LENGTH,
} from "~/constants/loyaltyConstants";
import { Authority, Objective } from "~/customHooks/useDeployLoyalty/types";
import { validateObjectiveInputs } from "~/utils/loyaltyValidation";

//TODO - this can prob be refactored to eliminate the need for additional state variables,
//and to eliminate the useEffect that is used here.

interface ObjectiveEditorProps {
  activeObjective: number;
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateObjectiveEditor({
  activeObjective,
  setIsEditorOpen,
}: ObjectiveEditorProps) {
  const [title, setTitle] = useState<string>("");
  const [authority, setAuthority] = useState<Authority>("USER");
  const [points, setPoints] = useState<string>("");
  const [inputError, setInputError] = useState<{
    isError: boolean;
    message: string;
  }>({
    isError: false,
    message: "",
  });
  const { objectives, setObjectives } = useDeployLoyaltyStore();
  const isNewObjective = activeObjective == objectives.length;

  useEffect(() => {
    if (!isNewObjective) {
      const existingObjective = objectives.find(
        (obj) => obj.id == activeObjective,
      );
      if (existingObjective) {
        setTitle(existingObjective?.title ?? "");
        setAuthority(existingObjective?.authority);
        setPoints(String(existingObjective?.reward));
      }
    }
  }, []);

  const isValidated = (): boolean => {
    const errorMessage = validateObjectiveInputs(
      title,
      authority,
      Number(points),
    );
    if (errorMessage) {
      setInputError({ isError: true, message: errorMessage });
      return false;
    }
    return true;
  };

  const addNewObjective = (): void => {
    if (objectives.length >= MAX_OBJECTIVES_LENGTH) {
      setInputError({
        isError: true,
        message: `Cannot add more than ${MAX_OBJECTIVES_LENGTH} objectives`,
      });
      return;
    }
    if (isValidated()) {
      const newObjective: Objective = {
        id: objectives.length,
        title,
        authority,
        reward: Number(points),
      };
      const newObjectives = [...objectives, newObjective].map((obj, index) => ({
        ...obj,
        id: index,
      }));
      setObjectives(newObjectives);
      setIsEditorOpen(false);
    }
  };

  const editExistingObjective = (): void => {
    if (!isNewObjective && isValidated()) {
      const updatedValues: Partial<Objective> = {
        title,
        authority,
        reward: Number(points),
      };
      const editedObjectives = objectives.map((obj) =>
        obj.id == activeObjective ? { ...obj, ...updatedValues } : { ...obj },
      );
      setObjectives(editedObjectives);
      setIsEditorOpen(false);
    }
  };

  return (
    <div className="border-box break-words">
      <div className="max-w-[50em]">
        <div className="flex flex-col">
          <div className="relative w-full">
            <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
              Objective Title
            </label>
            <input
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={MIN_OBJECTIVE_TITLE_LENGTH}
              maxLength={MAX_OBJECTIVE_TITLE_LENGTH}
              placeholder="e.g Purchase an item from our shop"
              className={`${
                inputError.isError && inputError.message.includes("Objective")
                  ? "ring-2 ring-error-1 focus:ring-primary-1"
                  : "ring-0 focus:ring-2 focus:ring-primary-1"
              } relative h-10 w-full min-w-0 appearance-none rounded-md border-2 border-solid border-transparent bg-dashboard-input p-4 text-base outline-none`}
            />
          </div>
          <div className="relative mt-5 w-full">
            <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
              Objective Authority
            </label>
            <select
              onChange={(e) => setAuthority(e.target.value as Authority)}
              value={authority}
              className="relative h-10 w-full min-w-0 rounded-md border-2 border-solid border-transparent bg-dashboard-input pl-2 text-base outline-none ring-0 focus:ring-2 focus:ring-primary-1"
            >
              <option value="USER">
                USER (the user can mark the objective as completed by
                themselves)
              </option>
              <option value="CREATOR">
                CREATOR (only the contract creator can mark as completed for a
                user)
              </option>
            </select>

            <div className="mt-2 leading-normal text-dashboard-tooltip">
              <span className="flex flex-row gap-1 break-words">
                *Authority: Who has the authority to mark the objective as
                completed for a user?
                <InfoIcon size={20} color="currentColor" />
              </span>
            </div>
            <hr className="mt-4 w-full border-t border-solid border-dashboard-divider opacity-60" />
          </div>
          <div className="relative mt-5 w-full">
            <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
              Points Amount for Completing This Objective
            </label>
            <input
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min={MIN_OBJECTIVE_POINTS_VALUE}
              max={MAX_OBJECTIVE_POINTS_VALUE}
              placeholder="e.g 1000"
              className={`${
                inputError.isError && inputError.message.includes("points")
                  ? "ring-2 ring-error-1 focus:ring-primary-1"
                  : "ring-0 focus:ring-2 focus:ring-primary-1"
              } relative h-10 w-full min-w-0 appearance-none rounded-md border-2 border-solid border-transparent bg-dashboard-input p-4 text-base outline-none`}
            />

            <div className="mt-2 leading-normal text-dashboard-tooltip">
              <span className="flex flex-row gap-1 break-words">
                *Points are tracked on-chain and used to reward users.{" "}
                <span className="text-primary-1">Learn more</span>
                <InfoIcon size={20} color="currentColor" />
              </span>
            </div>
            <hr className="mt-4 w-full border-solid border-[0px_0px_1px] border-dashboard-divider opacity-60" />
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
            onClick={isNewObjective ? addNewObjective : editExistingObjective}
            className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
          >
            {isNewObjective ? "Add" : "Save"}
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
