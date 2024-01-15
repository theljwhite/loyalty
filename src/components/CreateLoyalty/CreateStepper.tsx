import React from "react";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import type { CreationStep } from "~/pages/dashboard/create";
import CreateDeployStatus from "./CreateDeployStatus";
import { ArrowIcon } from "../UI/Dashboard/Icons";
import { usePreviousLoyaltyStep } from "~/customHooks/useLoyaltyPrevStep/useLoyaltyPrevStep";
import { validateStep } from "~/utils/loyaltyValidation";

interface StepperProps {
  steps: CreationStep[];
}

const Stepper: React.FC<StepperProps> = ({ steps }) => {
  const {
    step: currStep,
    setStep,
    furthestStep,
    setFurthestStep,
    errors,
    isLoading,
    isSuccess,
    ...state
  } = useDeployLoyaltyStore((state) => state);
  const goPreviousStep = usePreviousLoyaltyStep();

  const handleStepClick = (index: number): void => {
    if (index < currStep) {
      setStep(index);
      return;
    }

    for (
      let stepToValidate = currStep;
      stepToValidate <= index;
      stepToValidate++
    ) {
      const errorMessage = validateStep(stepToValidate, state);
      if (errorMessage) {
        setStep(stepToValidate);
        return;
      }

      setStep(index);
      if (index > furthestStep) {
        setFurthestStep(index);
      }
    }
  };

  return (
    <div>
      {isLoading || isSuccess ? (
        <CreateDeployStatus />
      ) : (
        <div className="relative m-0 mt-8 min-h-full">
          <div className="flex min-h-full flex-col">
            <div className="relative left-0 right-0 top-0 flex rounded-md bg-dashboard-menu">
              <ul className="m-0 flex list-none flex-row p-0">
                <div className="flex items-center">
                  <button
                    onClick={goPreviousStep}
                    disabled={currStep === 0}
                    className="relative ml-1 mr-1 inline-flex w-auto min-w-[2rem] select-none appearance-none items-center justify-center whitespace-nowrap rounded-md p-0 align-middle text-sm font-semibold leading-[1.2] text-dashboard-menuText outline-offset-[2px] outline-[transparent_solid_2px] duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform] disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    <span className="inline-block h-[1em] w-[1em] flex-shrink-0 select-none fill-current text-lg [transition:fill_200ms_cubic-bezier(0.4,_0,_0.2,_1)_0ms]">
                      <ArrowIcon size={16} color="currentColor" right={false} />
                    </span>
                  </button>
                  <button
                    onClick={() => handleStepClick(currStep + 1)}
                    disabled={currStep === furthestStep}
                    className="relative ml-1 mr-1 inline-flex w-auto min-w-[2rem] select-none appearance-none items-center  justify-center whitespace-nowrap rounded-md p-0 align-middle text-sm font-semibold leading-[1.2] text-dashboard-menuText outline-offset-[2px] outline-[transparent_solid_2px] duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform] disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    <span className="inline-block h-[1em] w-[1em] flex-shrink-0 select-none fill-current text-lg [transition:fill_200ms_cubic-bezier(0.4,_0,_0.2,_1)_0ms]">
                      <ArrowIcon size={16} color="currentColor" right={true} />
                    </span>
                  </button>
                </div>
                {steps.map((step, index) => {
                  return (
                    <span
                      onClick={() => handleStepClick(index)}
                      key={step.id}
                      className={`${
                        currStep === index
                          ? "border-b-2 border-b-primary-1 text-primary-1"
                          : "border-none text-dashboard-menuText"
                      } flex cursor-pointer px-4 py-3 [transition:color_0.1s_ease-in_0s,_border-color_0.1s_ease-in_0s]`}
                    >
                      {step.title}
                    </span>
                  );
                })}
              </ul>
            </div>
            <div className="ml-0 flex flex-grow flex-col bg-dashboard-menu p-8 text-dashboard-menuText [@media_screen_and(min-width:30em)]:ml-0 [@media_screen_and(min-width:48em)]:ml-0">
              <div>
                <div> {steps![currStep]!.content}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stepper;
