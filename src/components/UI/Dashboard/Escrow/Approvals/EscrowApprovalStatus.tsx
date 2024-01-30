import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import { type ApprovalSubmitStatus } from "./EscrowApprovalsForm";
import DashboardPageLoading from "../../DashboardPageLoading";
import DashboardInfoBox from "../../DashboardInfoBox";

//TODO 1/29 - finish

interface EscrowApprovalStatusProps {
  submitStatus: ApprovalSubmitStatus;
  setSubmitStatus: React.Dispatch<React.SetStateAction<ApprovalSubmitStatus>>;
}

export default function EscrowApprovalStatus({
  submitStatus,
  setSubmitStatus,
}: EscrowApprovalStatusProps) {
  const { rewardAddress, rewardInfo } = useEscrowApprovalsStore(
    (state) => state,
  );
  const { approveSender, approveRewards } = useEscrowApprovals();

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
        your deposit period will begin as you wish.
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-dashboard-menuText">
          Contract Address: {rewardAddress}
        </p>
        <p className=" text-dashboard-menuText">
          Collection Name: {rewardInfo.name}
        </p>
        <p className="text-dashboard-menuText">
          Collection Symbol: {rewardInfo.symbol}
        </p>
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
          className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
          type="button"
        >
          Write details to contract
        </button>
      </div>
    </div>
  );
}
