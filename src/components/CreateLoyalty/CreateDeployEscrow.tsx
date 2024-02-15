import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { useDeployEscrow } from "~/customHooks/useDeployEscrow/useDeployEscrow";
import { useDeployEscrowStore } from "~/customHooks/useDeployEscrow/store";
import { rewardTypeNumToPrismaEnum } from "~/utils/rewardTypeNumToPrismaEnum";
import { useAccount, useNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toastError, dismissToast } from "../UI/Toast/Toast";
import CreateEscrowApprovals from "./CreateEscrowApprovals";
import DashboardInfoBox from "../UI/Dashboard/DashboardInfoBox";
import DashboardSummaryTable from "../UI/Dashboard/DashboardSummaryTable";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";

export default function CreateDeployEscrow() {
  const [isEscrowApprovalsOpen, setIsEscrowApprovalsOpen] =
    useState<boolean>(false);
  const [isDeployConfirmOpen, setIsDeployConfirmOpen] =
    useState<boolean>(false);
  const {
    rewardType,
    deployLoyaltyData,
    reset: clearLoyaltyDeployData,
  } = useDeployLoyaltyStore((state) => state);

  const {
    isLoading,
    isSuccess,
    deployEscrowData,
    reset: clearEscrowDeployData,
  } = useDeployEscrowStore((state) => state);

  const { rewardAddress, senderAddress, rewardInfo } = useEscrowApprovalsStore(
    (state) => state,
  );

  const { deployEscrowContract } = useDeployEscrow();
  const { isConnected, address: userAddress } = useAccount();
  const { chain: userConnectedChain } = useNetwork();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  useEffect(() => {
    if (deployEscrowData && isSuccess) {
      setTimeout(() => {
        dismissToast();
        clearLoyaltyDeployData();
        clearEscrowDeployData();
        router.push(`/dashboard/programs/${deployLoyaltyData.address}`);
      }, 3000);
    }
  }, [deployEscrowData, isSuccess]);

  const handleDeployEscrow = async (): Promise<void> => {
    if (deployLoyaltyData.creator !== userAddress) {
      toastError(
        `Must deploy escrow contract from the same wallet that loyalty was deployed from: ${deployLoyaltyData.creator}`,
      );
    }
    if (deployLoyaltyData.chainId !== userConnectedChain?.id) {
      toastError(
        `Must deploy your escrow contract on the same chain as your loyalty contract, ${deployLoyaltyData.chain}`,
      );
    } else {
      setIsDeployConfirmOpen(false);
      deployEscrowContract();
    }
  };

  const openEscrowApprovalsForm = (): void => {
    setIsEscrowApprovalsOpen(true);
  };

  if (isEscrowApprovalsOpen) {
    return (
      <div className="space-y-8">
        <CreateEscrowApprovals
          setIsConfirmOpen={setIsDeployConfirmOpen}
          setIsEscrowApprovalsOpen={setIsEscrowApprovalsOpen}
        />
      </div>
    );
  }

  return (
    <>
      {isDeployConfirmOpen ? (
        <div className="space-y-8">
          <DashboardInfoBox
            info="Your rewards contract address has been approved for use in your loyalty program."
            infoType="success"
          />
          <h1 className="text-3xl font-semibold tracking-tight text-dashboard-heading">
            Your escrow contract is ready to deploy!
          </h1>

          <p className="my-4 pe-4 text-dashboard-menuText">
            Your rewards contract address will be set in escrow contract when
            deployed and you will be able to use tokens from this contract in
            your loyalty program. Review your details below and then deploy your
            escrow contract.
          </p>
          <div className="block h-auto">
            <div className="pb-4 pe-4 ps-4 pt-2">
              <DashboardSummaryTable
                title="Approvals Details"
                dataObj={{
                  rewardAddress: rewardAddress,
                  collectionName: rewardInfo.name,
                  collectionSymbol: rewardInfo.symbol,
                  ...(rewardInfo.decimals && {
                    collectionDecimals: String(rewardInfo.decimals),
                  }),
                  ...(senderAddress && {
                    depositorAddress: senderAddress,
                  }),
                }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-row items-center">
            <button
              onClick={() => setIsEscrowApprovalsOpen(true)}
              type="button"
              className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
            >
              Go back
            </button>
            <button
              onClick={handleDeployEscrow}
              className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white disabled:bg-dashboard-input disabled:text-dashboard-lightGray"
              type="button"
            >
              Deploy escrow contract
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-dashboard-heading">
            {isLoading
              ? "Deploying your escrow contract..."
              : "Deploy your escrow contract"}
          </h1>
          {isLoading ? (
            <div>
              <p className="my-4 pe-4 text-dashboard-menuText">
                Follow the prompts in your wallet and please be patient while we
                deploy your escrow contract. Stay on this page to ensure that
                delicate processes are not interrupted. Once it is finished, you
                will be redirected to your loyalty program dashboard.
              </p>
            </div>
          ) : (
            <div>
              <p className="my-4 pe-4 text-dashboard-menuText">
                Although you can wait and deploy your escrow contract later, it
                is highly recommended that you quickly deploy it now. Since your
                loyalty program reward type is{" "}
                {rewardTypeNumToPrismaEnum(rewardType)}, escrow is needed for
                your program to function properly.
              </p>
              <p className="my-4 pe-4 text-dashboard-menuText">
                Deploying escrow contract is fast. You will only need to approve
                2 transactions, one for deploying escrow, and one that syncs it
                to your loyalty program contract.
              </p>
              <p className="my-4 pe-4 text-dashboard-menuText">
                But first you will also need to enter the address of the
                contract you wish to reward tokens from to ensure that it is
                compatible with your escrow contract.
              </p>
            </div>
          )}
          {isLoading ? (
            <div className="flex h-full w-full justify-start">
              <Image
                width={300}
                height={300}
                alt="gif of a smart contract"
                src="/utilityImages/blockchain.gif"
              />
            </div>
          ) : (
            <div className="mt-12 flex h-full w-full justify-start">
              <Link
                href={`/dashboard/programs/${deployLoyaltyData.address}`}
                className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
              >
                Ignore and go to dashboard
              </Link>
              <button
                type="button"
                onClick={
                  isConnected ? openEscrowApprovalsForm : openConnectModal
                }
                className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
              >
                {isConnected ? "Continue" : "Connect Wallet"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
