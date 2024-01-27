import React, { useState } from "react";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { usePreviousLoyaltyStep } from "~/customHooks/useLoyaltyPrevStep/useLoyaltyPrevStep";
import { useDeployLoyalty } from "~/customHooks/useDeployLoyalty/useDeployLoyalty";
import { useNetwork, useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import CreateDeploySummary from "./CreateDeploySummary";
import { RightChevron, FormErrorIcon } from "../UI/Dashboard/Icons";

//TODO - add some more validation here before the deploy?

export default function CreateDeploy() {
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const { errors, step } = useDeployLoyaltyStore((state) => state);
  const currentStepError = errors.find((error) => error.step === step);
  const goPreviousStep = usePreviousLoyaltyStep();
  const { deployLoyaltyProgram } = useDeployLoyalty();

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { openConnectModal } = useConnectModal();

  return (
    <>
      <div className="mb-6 flex flex-row items-center justify-between text-dashboard-heading">
        <div className="flex min-h-10 items-center">
          <nav className="block">
            <ol className="me-[1em]  list-decimal">
              <li className="inline-flex items-center">
                <span className="cursor-pointer list-decimal items-center hover:underline">
                  Deploy
                </span>

                <span className="me-1 ms-1 text-dashboard-tooltip">
                  <RightChevron size={16} color="currentColor" />
                </span>
              </li>

              <li className="inline-flex items-center">
                <span className="cursor-pointer list-decimal items-center hover:underline">
                  Deploy Loyalty Program
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-dashboard-heading">
        Almost ready to deploy!
      </h1>
      <p className="my-4 pe-4 text-dashboard-menuText">
        Connect your wallet and switch to the desired blockchain network that
        you wish to deploy your contract on. Optionally, you can also first
        review your loyalty program details below.
      </p>

      <div className="border-box mt-12 break-words">
        <div className="max-w-[50em]">
          <div className="mt-5 flex">
            <div className="my-3 w-full">
              <div
                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                className="border-y border-dashboard-divider"
              >
                <CreateDeploySummary isSummaryOpen={isSummaryOpen} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="mt-4 w-full border-solid border-[0px_0px_1px] border-dashboard-divider opacity-60" />

      <div className="mt-4 flex flex-col">
        {isConnected && address && chain && (
          <div className="relative">
            Your contract is now ready to be deployed on {chain?.name}
          </div>
        )}
        <hr className="mt-4 w-full border-solid border-[0px_0px_1px] border-dashboard-divider opacity-60" />
        <div className="mt-4 flex flex-row items-center">
          <button
            type="button"
            onClick={goPreviousStep}
            className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
          >
            Back
          </button>
          <button
            type="button"
            onClick={isConnected ? deployLoyaltyProgram : openConnectModal}
            className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
          >
            {isConnected ? "Deploy" : "Connect"}
          </button>
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
