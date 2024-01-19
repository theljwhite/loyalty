import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { dismissToast } from "../UI/Toast/Toast";
import { RightChevron } from "../UI/Dashboard/Icons";
import DashboardInfoBox from "../UI/Dashboard/DashboardInfoBox";
import { allChains } from "~/configs/wagmi";

//TODO - this useEffect may not be needed, can prob router push direct from...
//...useDeployLoyalty hook

export default function CreateDeployStatus() {
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>("");
  const router = useRouter();
  const {
    name,
    isSuccess,
    deployLoyaltyData,
    reset: clearLoyaltyDeployData,
  } = useDeployLoyaltyStore();
  const { chain: deployedProgramChain, hash, address } = deployLoyaltyData;

  useEffect(() => {
    if (isSuccess && deployLoyaltyData) {
      getBlockExplorerUrl();
      setTimeout(() => {
        dismissToast();
        clearLoyaltyDeployData();
        router.push(`/dashboard/programs/${address}`);
      }, 3000);
    }
  }, [deployLoyaltyData, isSuccess]);

  const getBlockExplorerUrl = (): void => {
    const correctChain = allChains.find(
      (chain) => chain.name === deployedProgramChain,
    );
    if (
      correctChain?.blockExplorers?.default ||
      correctChain?.blockExplorers?.etherscan
    ) {
      setBlockExplorerUrl(
        correctChain?.blockExplorers.etherscan?.url ??
          correctChain?.blockExplorers.default.url ??
          "",
      );
    }
  };

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
                  {name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-dashboard-heading">
        Your loyalty program is deploying
      </h1>
      <p className="my-4 pe-4 text-dashboard-menuText">
        Remain on this page while your smart contract deploys. You will be
        redirected to your loyalty program when your contract has finished
        deploying.
      </p>
      <div className="flex h-full w-full justify-start">
        <Image
          width={300}
          height={300}
          alt="gif of a smart contract"
          src="/utilityImages/blockchain.gif"
        />
      </div>
      {isSuccess && deployLoyaltyData && (
        <div className="flex h-full w-full justify-start">
          <DashboardInfoBox
            infoType="success"
            info={`Your contract deployed to '${deployedProgramChain}' with address: '${address}'. Redirecting you to your loyalty program.`}
            outlink={`${blockExplorerUrl}tx/${hash}`}
            outlinkText="View your transaction"
          />
        </div>
      )}
    </>
  );
}
