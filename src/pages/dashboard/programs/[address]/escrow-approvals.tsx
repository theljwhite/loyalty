import React, { useState } from "react";
import { type NextPage } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import {
  senderInputError,
  rewardAddressInputError,
} from "~/utils/escrowApprovalsValidation";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import DashboardSingleInputBox from "~/components/UI/Dashboard/DashboardSingleInputBox";
import DashboardCopyDataBox from "~/components/UI/Dashboard/DashboardCopyDataBox";
import { FormErrorIcon } from "~/components/UI/Dashboard/Icons";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";
import { useLoyaltyContractRead } from "~/customHooks/useLoyaltyContractRead/useLoyaltyContractRead";

//TODO - make address that loyalty contract was deployed from the default placeholder...
//...for the Sender Wallet input field
//TODO 1/29 - finish

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

type EscrowInputError = {
  valid: boolean;
  message: string;
};

const EscrowApprovals: NextPage = () => {
  const [isSenderValid, setIsSenderValid] = useState<EscrowInputError>({
    valid: false,
    message: "",
  });
  const [isRewardContractValid, setIsRewardContractValid] =
    useState<EscrowInputError>({ valid: false, message: "" });
  const {
    senderAddress,
    rewardAddress,
    setSenderAddress,
    setRewardAddress,
    error: approvalsError,
  } = useEscrowApprovalsStore((state) => state);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data: escrowDetails, isLoading: keyLoading } =
    api.loyaltyPrograms.getEscrowApprovalsRelatedData.useQuery(
      { loyaltyAddress: String(loyaltyAddress) },
      { refetchOnWindowFocus: false },
    );
  const { isERC20Verified, isERC721Verified, isERC1155Verified } =
    useEscrowApprovals();
  const { getContractVersion, getContractState, getLoyaltyProgramSettings } =
    useLoyaltyContractRead(String(loyaltyAddress));

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

  const handleApprovalSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    //TODO finish
    const settings = await getLoyaltyProgramSettings();
    console.log("settings 2 -->", settings);
  };

  return (
    <div className="space-y-8">
      <DashboardHeader title="Escrow Approvals" />
      <DashboardInfoBanner
        infoType="info"
        info="Some quick approvals are needed to ensure the safety of your loyalty program. Complete the checklist below to get your escrow contract quickly ready to issue rewards."
      />
      <DashboardCopyDataBox
        title="Deposit Key"
        description="Your deposit key for depositing tokens into your escrow contract. It is used to deposit tokens to escrow when deposit period is active."
        copyBoxLabel="Deposit Key"
        dataToCopy={escrowDetails?.depositKey ?? ""}
        copySuccessMessage="Copied deposit key"
        isSecret
        containerBg="white"
        showBorder
        dataLoading={keyLoading}
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
    </div>
  );
};

// @ts-ignore
EscrowApprovals.getLayout = getDashboardLayout;
export default EscrowApprovals;
