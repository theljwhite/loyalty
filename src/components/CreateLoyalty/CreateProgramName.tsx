import React from "react";
import { FormErrorIcon, InfoIcon } from "../UI/Dashboard/Icons";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import CreateNextButton from "./CreateNextButton";
import { validationFuncs } from "~/utils/loyaltyValidation";
import { useNextLoyaltyStep } from "~/customHooks/useNextLoyaltyStep/useNextLoyaltyStep";

export default function CreateProgramName() {
  const { name, setName, description, setDescription, step, errors } =
    useDeployLoyaltyStore((state) => state);
  const currentStepError = errors.find((error) => error.step === step);

  const nameValidation = validationFuncs.get(step);
  const descriptionValidation = validationFuncs.get(step);

  const onNextStep = useNextLoyaltyStep([
    () => nameValidation?.[0]?.validation(name),
    () => descriptionValidation?.[1]?.validation(description),
  ]);

  return (
    <>
      <div className="mb-6 flex flex-row items-center gap-2 text-dashboard-heading">
        <span>Name & Details </span>
      </div>
      <form className="border-box break-words">
        <div className="max-w-[50em]">
          <div className="flex flex-col">
            <div className="relative w-full">
              <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
                Loyalty Program Name
              </label>
              <input
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={31}
                placeholder="e.g My Company Rewards"
                className={`${
                  currentStepError
                    ? "ring-2 ring-error-1 focus:ring-primary-1"
                    : "ring-0 focus:ring-2 focus:ring-primary-1"
                } relative h-10 w-full min-w-0 appearance-none rounded-md border-2 border-solid border-transparent bg-dashboard-input p-4 text-base outline-none`}
              />
              <div className="mt-2 leading-normal text-dashboard-tooltip">
                <span className="flex flex-row gap-1 break-words">
                  Name is stored in your smart contract and can not be changed
                  after deployment
                  <InfoIcon size={20} color="currentColor" />
                </span>
              </div>
            </div>
            <div className="relative mt-5 w-full">
              <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
                Description
              </label>
              <textarea
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={80}
                placeholder="Optional description of the loyalty program and its goals"
                className="relative h-[42px] min-h-[80px] w-full min-w-0 appearance-none rounded-md border-2 border-solid border-transparent bg-dashboard-input p-2 py-2 align-top text-base leading-[1.375rem] outline-none focus:ring-2 focus:ring-primary-1"
              />
              <hr className="mt-4 w-full border-solid border-[0px_0px_1px] border-dashboard-divider opacity-60" />
            </div>
          </div>
          <hr className="mt-4 w-full border-solid border-[0px_0px_1px] border-dashboard-divider opacity-60" />

          <div className="mt-4 flex flex-row items-center">
            <CreateNextButton step={step} onClick={onNextStep} />
            {currentStepError && (
              <span className="flex flex-row gap-1 truncate pl-4 font-medium text-error-1">
                <FormErrorIcon size={20} color="currentColor" />{" "}
                {currentStepError.message}
              </span>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
