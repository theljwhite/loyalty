import { useState } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import { useLoyaltyContractRead } from "~/customHooks/useLoyaltyContractRead/useLoyaltyContractRead";
import { useEscrowContractRead } from "~/customHooks/useEscrowContractRead/useEscrowContractRead";
import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";
import {
  senderInputError,
  rewardAddressInputError,
} from "~/utils/escrowApprovalsValidation";
import DashboardSingleInputBox from "../../DashboardSingleInputBox";
import DashboardCopyDataBox from "../../DashboardCopyDataBox";
import DashboardInfoBanner from "../../DashboardInfoBanner";
import EscrowApprovalConfirm from "./EscrowApprovalConfirm";
import { FormErrorIcon } from "../../Icons";

type EscrowInputError = {
  valid: boolean;
  message: string;
};

export type ApprovalSubmitStatus =
  | "Idle"
  | "Loading"
  | "Confirming"
  | "Confirmed"
  | "Failure";

export default function EscrowApprovalsForm() {
  const [isSenderValid, setIsSenderValid] = useState<EscrowInputError>({
    valid: false,
    message: "",
  });
  const [isRewardContractValid, setIsRewardContractValid] =
    useState<EscrowInputError>({ valid: false, message: "" });
  const [submitStatus, setSubmitStatus] =
    useState<ApprovalSubmitStatus>("Idle");

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const {
    senderAddress,
    rewardAddress,
    setSenderAddress,
    setRewardAddress,
    setEscrowType,
    error: approvalsError,
  } = useEscrowApprovalsStore((state) => state);

  const { isERC20Verified, isERC721Verified, isERC1155Verified } =
    useEscrowApprovals();

  const { data: escrowDetails, isLoading: escrowLoading } =
    api.loyaltyPrograms.getEscrowApprovalsRelatedData.useQuery(
      { loyaltyAddress: String(loyaltyAddress) },
      { refetchOnWindowFocus: false },
    );

  const { getContractState, getLoyaltyProgramSettings } =
    useLoyaltyContractRead(String(loyaltyAddress));
  const { getEscrowState } = useEscrowContractRead(
    escrowDetails?.escrowAddress ?? "",
    escrowDetails?.escrowType ?? "ERC20",
  );

  const handleApprovalSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitStatus("Loading");
    const stateFromLoyaltyContract = await getContractState();
    const stateFromEscrowContract = await getEscrowState();
    const contractSettings = await getLoyaltyProgramSettings();
    let isVerified: boolean = false;

    if (
      (stateFromLoyaltyContract !== "Idle" &&
        stateFromLoyaltyContract !== "AwaitingEscrowSetup") ||
      stateFromEscrowContract !== "AwaitingEscrowApprovals"
    ) {
      setSubmitStatus("Failure");
      return;
    }

    if (contractSettings?.rewardType === "ERC20") {
      isVerified = await isERC20Verified();
      setEscrowType("ERC20");
    } else if (contractSettings?.rewardType === "ERC721") {
      isVerified = await isERC721Verified();
      setEscrowType("ERC721");
    } else if (contractSettings?.rewardType === "ERC1155") {
      isVerified = await isERC1155Verified();
      setEscrowType("ERC1155");
    }

    if (isVerified) setSubmitStatus("Confirming");
    if (!isVerified) setSubmitStatus("Failure");
  };

  const onSenderChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSenderAddress(e.target.value);
    const inputError: string = senderInputError([e.target.value]);
    if (inputError) setIsSenderValid({ valid: false, message: inputError });
    else setIsSenderValid({ valid: true, message: "" });
  };

  const onRewardAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setRewardAddress(e.target.value);
    const inputError: string = rewardAddressInputError(e.target.value);
    if (inputError) {
      setIsRewardContractValid({ valid: false, message: inputError });
    } else setIsRewardContractValid({ valid: true, message: "" });
  };

  if (submitStatus !== "Idle")
    return (
      <EscrowApprovalConfirm
        submitStatus={submitStatus}
        setSubmitStatus={setSubmitStatus}
        escrowDetails={escrowDetails}
      />
    );
  return (
    <>
      <DashboardInfoBanner
        infoType="info"
        info="Some quick approvals are needed to ensure the safety of your loyalty program. Complete the checklist below to get your escrow contract quickly ready to issue rewards."
      />
      <DashboardCopyDataBox
        title="Deposit Key"
        description="Your deposit key for depositing tokens into your escrow contract when deposit period is active. You can also view this key later in Escrow Settings."
        copyBoxLabel="Deposit Key"
        dataToCopy={escrowDetails?.depositKey ?? ""}
        copySuccessMessage="Copied deposit key"
        isSecret
        containerBg="white"
        showBorder
        dataLoading={escrowLoading}
      />
      <form className="space-y-8" onSubmit={(e) => handleApprovalSubmit(e)}>
        <DashboardSingleInputBox
          title="Sender Wallet Address"
          description="Who will be managing your loyalty/escrow contracts and depositing tokens to be rewarded? Defaults to deployer address. This cannot be changed after it is written to the smart contract."
          onChange={(e) => onSenderChange(e)}
          stateVar={senderAddress}
          errorState={isSenderValid.message}
          placeholder={
            escrowDetails?.creatorAddress ?? "Enter sender wallet address"
          }
          isValid={isSenderValid.valid}
          isRequiredField
        />
        <DashboardSingleInputBox
          title="Reward Token Address"
          description="Enter the address of the smart contract that you wish to reward tokens from. This will ensure that it is compatible with your escrow contract and help to prevent malicious activity."
          onChange={(e) => onRewardAddressChange(e)}
          stateVar={rewardAddress}
          errorState={isRewardContractValid.message}
          placeholder="TODO user address here"
          isValid={isRewardContractValid.valid}
          isRequiredField
        />
        <div className="mt-6 flex flex-row items-center">
          {approvalsError && (
            <span className="flex flex-row gap-1 truncate pl-4 font-medium text-error-1">
              <FormErrorIcon size={20} color="currentColor" /> {approvalsError}
            </span>
          )}
          <button
            type="button"
            className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
          >
            Learn More First
          </button>
          <button
            className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
            type="submit"
          >
            Submit Details for Approval
          </button>
        </div>
      </form>
    </>
  );
}
