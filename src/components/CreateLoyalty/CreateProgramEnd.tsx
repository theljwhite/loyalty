import React, { useState } from "react";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { useNextLoyaltyStep } from "~/customHooks/useNextLoyaltyStep/useNextLoyaltyStep";
import { validationFuncs } from "~/utils/loyaltyValidation";
import CreateNextButton from "./CreateNextButton";
import { RightChevron, FormErrorIcon, DateIcon } from "../UI/Dashboard/Icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateProgramEnd() {
  const { programEndsAt, setProgramEnd, step, errors } = useDeployLoyaltyStore(
    (state) => state,
  );
  const [time, setTime] = useState<string>(programEndsAt.toLocaleTimeString());
  const currentStepError = errors.find((error) => error.step === step);
  const programEndValidation = validationFuncs.get(step);
  const onNextStep = useNextLoyaltyStep([
    () => programEndValidation?.[0]?.validation(programEndsAt),
  ]);

  const currentDate = new Date();
  const oneDayInMs = 86_400_000;
  const minAllowedEndDate = new Date(currentDate.getTime() + oneDayInMs);

  const onDateChange = (date: Date | null): void => {
    if (date && date > minAllowedEndDate) {
      setProgramEnd(date);
      const time = date.toLocaleTimeString();
      setTime(time);
    }
  };

  return (
    <>
      <div className="max-w-[50em]">
        <div className="mb-6 flex flex-row items-center justify-between text-dashboard-heading">
          <div className="flex min-h-10 items-center">
            <nav className="block">
              <ol className="me-[1em]  list-decimal">
                <li className="inline-flex items-center">
                  <span className="cursor-pointer list-decimal items-center hover:underline">
                    Program End Date
                  </span>

                  <span className="me-1 ms-1 text-dashboard-tooltip">
                    <RightChevron size={16} color="currentColor" />
                  </span>
                </li>

                <li className="inline-flex items-center">
                  <span className="cursor-pointer list-decimal items-center hover:underline">
                    Set End Date
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="relative mt-5 w-full">
          <div className="flex flex-col">
            <div className="relative w-full">
              <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
                Choose Program End Date
              </label>

              <div className="flex flex-row">
                <label className="flex flex-row">
                  <DatePicker
                    className={`${
                      currentStepError
                        ? "ring-2 ring-error-1 focus:ring-primary-1"
                        : "ring-0 focus:ring-2 focus:ring-primary-1"
                    } relative h-10 w-full min-w-[600px] cursor-pointer appearance-none rounded-l-md border-2 border-solid border-transparent bg-dashboard-input p-4 text-base outline-none`}
                    selected={programEndsAt}
                    onChange={(date) => onDateChange(date)}
                    showPreviousMonths={false}
                    minDate={minAllowedEndDate}
                    showTimeSelect
                    showTimeInput
                    timeIntervals={60}
                    timeFormat="HH:mm"
                  />
                  <span className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-md bg-primary-1 text-white">
                    <DateIcon size={18} color="currentColor" />
                  </span>
                </label>
              </div>
              <div className="mt-2 flex flex-col gap-4 leading-normal text-dashboard-tooltip">
                <span className="flex flex-row gap-1 break-words">
                  *When do you want your loyalty program to end? Once deployed,
                  action cannot be undone.
                </span>
                <span className="flex flex-row gap-1 break-words">
                  Your Program End Date: {programEndsAt.toDateString()} @ {time}
                </span>
              </div>
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
      </div>
    </>
  );
}
