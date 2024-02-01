import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import { useEscrowContractRead } from "~/customHooks/useEscrowContractRead/useEscrowContractRead";
import { type ApprovalSubmitStatus } from "./EscrowApprovalsForm";
import DashboardPageLoading from "../../DashboardPageLoading";
import DashboardInfoBox from "../../DashboardInfoBox";
import DashboardSummaryTable from "../../DashboardSummaryTable";
import EscrowApprovalReceipt from "./EscrowApprovalReceipt";
import { api } from "~/utils/api";
import { type EscrowType } from "@prisma/client";
import { toastLoading, dismissToast } from "~/components/UI/Toast/Toast";

//TODO- this flow is temporary as it may change due to changes that I will...
//potentially make in the smart contracts (these steps can maybe be avoided or grouped) in the...
//next versions of the smart contracts.

//TODO 1/31 - finish this (and see if useEffect is really the best way here)

interface EscrowApprovalStatusProps {
  submitStatus: ApprovalSubmitStatus;
  setSubmitStatus: React.Dispatch<React.SetStateAction<ApprovalSubmitStatus>>;
  escrowDetails: EscrowDetails;
}

type EscrowDetails =
  | {
      escrowAddress: string;
      escrowType: EscrowType;
      creatorAddress: string | null;
      depositKey: string;
    }
  | undefined;

export default function EscrowApprovalConfirm({
  submitStatus,
  setSubmitStatus,
  escrowDetails,
}: EscrowApprovalStatusProps) {
  const { isConnected, address: userConnectedAddress } = useAccount();
  const { openConnectModal } = useConnectModal();
  const {
    senderAddress,
    rewardAddress,
    rewardInfo,
    isLoading: approvalsLoading,
    isSuccess: approvalsSuccess,
    isRewardAddressApproved: isRewardsApprovedState,
    isSenderApproved: isSenderApprovedState,
  } = useEscrowApprovalsStore((state) => state);

  const { isSenderApproved, isERC20TokenApproved, isCollectionApproved } =
    useEscrowContractRead(
      escrowDetails?.escrowAddress ?? "",
      escrowDetails?.escrowType ?? "ERC1155",
    );
  const { approveSender, approveRewards } = useEscrowApprovals();
  const { mutate: updateEscrowDb } = api.escrow.doApprovalsUpdate.useMutation();

  useEffect(() => {
    if (isSenderApprovedState && isRewardsApprovedState) {
      verifyContractStateChangeUpdateDb();
      dismissToast();
    }
  }, [isSenderApprovedState, isRewardsApprovedState]);

  const handleWriteDetailsToContract = async (): Promise<void> => {
    toastLoading("View the prompt in wallet to approve sender");
    if (escrowDetails) {
      const approvedSenderSuccess = await approveSender(
        escrowDetails.escrowAddress,
      );
      if (approvedSenderSuccess) {
        dismissToast();
        toastLoading("One more wallet prompt to approve rewards contract");
        await approveRewards(escrowDetails.escrowAddress);
      }
    }
  };

  const verifyContractStateChangeUpdateDb = async (): Promise<void> => {
    const escrowRewardType = escrowDetails?.escrowType;
    const isSenderApprovedInContract = await isSenderApproved(senderAddress);
    let rewardsApprovedInContract: boolean = false;

    if (escrowRewardType === "ERC20") {
      rewardsApprovedInContract = await isERC20TokenApproved(rewardAddress);
    }

    if (escrowRewardType === "ERC721" || escrowRewardType === "ERC1155") {
      rewardsApprovedInContract = await isCollectionApproved(rewardAddress);
    }

    updateEscrowDb({
      escrowAddress: escrowDetails?.escrowAddress ?? "",
      senderAddress: isSenderApprovedInContract ? senderAddress : undefined,
      rewardAddress: rewardsApprovedInContract ? rewardAddress : undefined,
      isSenderApproved: isSenderApprovedInContract,
      isRewardApproved: rewardsApprovedInContract,
    });
  };

  if (submitStatus === "Loading") {
    return <DashboardPageLoading />;
  }
  if (approvalsLoading || approvalsSuccess) return <EscrowApprovalReceipt />;

  return (
    <div className="space-y-8">
      <DashboardInfoBox
        info={`Your sender address and rewards contract address have been approved for use in your loyalty program.`}
        infoType="success"
      />
      <h1 className="text-3xl font-semibold tracking-tight text-dashboard-heading">
        Your details passed the check!
      </h1>

      <p className="my-4 pe-4 text-dashboard-menuText">
        Your sender address and rewards contract address have been approved for
        use in your loyalty program! Submit these details into your contract and
        then you can begin your deposit period at your discretion.
      </p>
      <div className="block h-auto">
        <div className="pb-4 pe-4 ps-4 pt-2">
          <DashboardSummaryTable
            title="Approvals Details"
            dataObj={{
              senderAddress: senderAddress,
              rewardAddress: rewardAddress,
              collectionName: rewardInfo.name,
              collectionSymbol: rewardInfo.symbol,
              ...(rewardInfo.decimals && {
                collectionDecimals: String(rewardInfo.decimals),
              }),
            }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-row items-center">
        <button
          onClick={() => setSubmitStatus("Idle")}
          type="button"
          className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
        >
          Go back
        </button>
        <button
          disabled={approvalsLoading || approvalsSuccess}
          onClick={
            isConnected && userConnectedAddress
              ? handleWriteDetailsToContract
              : openConnectModal
          }
          className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white disabled:bg-dashboard-input disabled:text-dashboard-lightGray"
          type="button"
        >
          Write details to contract
        </button>
      </div>
    </div>
  );
}
