import { useState } from "react";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";
import {
  senderInputError,
  rewardAddressInputError,
} from "~/utils/escrowApprovalsValidation";
import DashboardSingleInputBox from "../UI/Dashboard/DashboardSingleInputBox";
import DashboardInfoBox from "../UI/Dashboard/DashboardInfoBox";
import { FormErrorIcon } from "../UI/Dashboard/Icons";
import { RewardType } from "~/customHooks/useDeployLoyalty/types";
import { rewardTypeNumToPrismaEnum } from "~/utils/rewardTypeNumToPrismaEnum";

interface CreateEscrowApprovalsProps {
  setIsConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEscrowApprovalsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type EscrowInputError = {
  valid: boolean;
  message: string;
};

export default function CreateEscrowApprovals({
  setIsConfirmOpen,
  setIsEscrowApprovalsOpen,
}: CreateEscrowApprovalsProps) {
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
    setEscrowType,
    error: approvalsError,
    setError,
  } = useEscrowApprovalsStore((state) => state);

  const { rewardType } = useDeployLoyaltyStore((state) => state);

  const { isERC20Verified, isERC721Verified, isERC1155Verified } =
    useEscrowApprovals();

  const handleApprovalSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    let isRewardContractVerified: boolean = false;

    if (rewardType === RewardType.ERC20) {
      isRewardContractVerified = await isERC20Verified();
      setEscrowType("ERC20");
    } else if (rewardType === RewardType.ERC721) {
      isRewardContractVerified = await isERC721Verified();
      setEscrowType("ERC721");
    } else if (rewardType === RewardType.ERC1155) {
      isRewardContractVerified = await isERC1155Verified();
      setEscrowType("ERC1155");
    } else {
      setError("Incorrect reward type - escrow is not needed");
    }

    if (isRewardContractVerified) {
      setIsConfirmOpen(true);
      setIsEscrowApprovalsOpen(false);
    }
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

  return (
    <div>
      <form className="space-y-8" onSubmit={(e) => handleApprovalSubmit(e)}>
        <DashboardInfoBox
          infoType="warn"
          info="Before you deploy your escrow contract, complete the form below to ensure that your escrow contract is compatible with the contract that you will use to reward tokens from. The info you enter below will be written into your escrow contract."
        />
        <DashboardSingleInputBox
          title="Additional Depositor"
          description="By default, the contract creator (you) will be allowed to deposit tokens and manage escrow contract. If you need someone else to be able to deposit, enter their address here"
          onChange={(e) => onSenderChange(e)}
          stateVar={senderAddress}
          errorState={isSenderValid.message}
          placeholder="Enter depositor wallet address"
          disableCondition={false}
          isValid={isSenderValid.valid}
        />
        <DashboardSingleInputBox
          title="Reward Token Address"
          description="Enter the address of the smart contract that you wish to reward tokens from. This will ensure that it is compatible with your escrow contract and help to prevent malicious activity."
          onChange={(e) => onRewardAddressChange(e)}
          stateVar={rewardAddress}
          errorState={isRewardContractValid.message}
          placeholder={`Enter ${rewardTypeNumToPrismaEnum(
            rewardType,
          )} contract address here`}
          disableCondition={false}
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
            Confirm details
          </button>
        </div>
      </form>
    </div>
  );
}
