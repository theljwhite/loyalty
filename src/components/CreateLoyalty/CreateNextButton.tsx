import React from "react";
import Link from "next/link";
import { ROUTE_DASHBOARD_HOME } from "~/configs/routes";
import { usePreviousLoyaltyStep } from "~/customHooks/useLoyaltyPrevStep/useLoyaltyPrevStep";

interface CreateNextButtonProps {
  step: number;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const CreateNextButton: React.FC<CreateNextButtonProps> = ({
  step,
  onClick: goNextStep,
}) => {
  const goPreviousStep = usePreviousLoyaltyStep();

  return (
    <>
      {step === 0 ? (
        <Link href={ROUTE_DASHBOARD_HOME}>
          <span className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText">
            Cancel
          </span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={goPreviousStep}
          className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
        >
          Back
        </button>
      )}
      <button
        type="button"
        onClick={goNextStep}
        className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
      >
        Next
      </button>
    </>
  );
};

export default CreateNextButton;
