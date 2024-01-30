import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import { type ApprovalSubmitStatus } from "./EscrowApprovalsForm";
import DashboardPageLoading from "../../DashboardPageLoading";
import DashboardInfoBox from "../../DashboardInfoBox";
import DashboardSummaryTable from "../../DashboardSummaryTable";

//TODO 1/29 - finish

interface EscrowApprovalStatusProps {
  submitStatus: ApprovalSubmitStatus;
  setSubmitStatus: React.Dispatch<React.SetStateAction<ApprovalSubmitStatus>>;
}

export default function EscrowApprovalConfirm({
  submitStatus,
  setSubmitStatus,
}: EscrowApprovalStatusProps) {
  const { isConnected, address: userConnectedAddress } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { senderAddress, rewardAddress, rewardInfo } = useEscrowApprovalsStore(
    (state) => state,
  );
  const { approveSender, approveRewards } = useEscrowApprovals();

  const handleWriteDetailsToContract = async (): Promise<void> => {
    //TODO - finish
    //await approveSender()
  };

  if (submitStatus === "Loading") return <DashboardPageLoading />;
  if (submitStatus === "Confirmed" || submitStatus === "Failure") {
    return <div>TODO confirmed or failure</div>;
  }

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
          onClick={
            isConnected && userConnectedAddress
              ? handleWriteDetailsToContract
              : openConnectModal
          }
          className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
          type="button"
        >
          Write details to contract
        </button>
      </div>
    </div>
  );
}
