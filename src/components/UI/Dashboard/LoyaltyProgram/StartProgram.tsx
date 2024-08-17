import { useState } from "react";
import { useLoyaltyAbi } from "~/customHooks/useContractAbi/useContractAbi";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import useConfirmAction from "~/customHooks/useConfirmAction";
import { useError } from "~/customHooks/useError";
import { api } from "~/utils/api";
import { writeContract, waitForTransaction } from "wagmi/actions";
import { toastSuccess, toastLoading, toastError } from "../../Toast/Toast";
import DashboardContentBox from "../DashboardContentBox";
import DashboardToggleSwitch from "../DashboardToggleSwitch";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";

interface StartProgramProps {
  loyaltyAddress: string;
}

export default function StartProgram({ loyaltyAddress }: StartProgramProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const {
    confirmEntry,
    confirmOpen,
    confirmValid,
    setConfirmOpen,
    onConfirmChange,
    closeConfirm,
  } = useConfirmAction();
  const { handleLoyaltyError } = useError();

  const { abi } = useLoyaltyAbi();
  const loyaltyContractConfig = {
    address: loyaltyAddress as `0x${string}`,
    abi,
  };
  const { isConnected, address: userAddress } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { data } = api.loyaltyPrograms.getBasicLoyaltyDataByAddress.useQuery(
    {
      contractAddress: loyaltyAddress,
    },
    { refetchOnWindowFocus: false },
  );
  const { mutateAsync: updateProgramAndEscrowState } =
    api.loyaltyPrograms.updateProgramStateOrEscrowState.useMutation();

  const programState = data?.state;
  const alreadyActiveProgram = programState === "Active";
  const chainId = data?.chainId;

  const doSetActiveChecksOpenConfirm = (): void => {
    if (!isConnected || !userAddress) openConnectModal?.();

    const rewardType = data?.rewardType;
    if (!data || !programState || !rewardType) {
      toastError("Program data not found.");
    }

    if (rewardType === "Points" && programState !== "Idle") {
      toastError("Your program is not ready to be made active.");
    }

    if (rewardType !== "Points") {
      const escrowState = data?.escrowState;

      if (!escrowState) toastError("Program data not found.");
      if (programState !== "AwaitingEscrowSetup" || escrowState !== "Idle") {
        toastError("Your program is not ready to be made active.");
      }
    }

    setConfirmOpen(true);
  };

  const makeProgramActive = async (): Promise<void> => {
    closeConfirm();
    toastLoading("Request sent to wallet", true);
    try {
      const setProgramActive = await writeContract({
        ...loyaltyContractConfig,
        functionName: "setLoyaltyProgramActive",
        args: [],
      });
      const receipt = await waitForTransaction({
        chainId,
        hash: setProgramActive.hash,
      });

      if (receipt.status === "success") {
        const dbUpdate = await updateProgramAndEscrowState({
          loyaltyAddress,
          newProgramState: "Active",
          newEscrowState: data?.escrowAddress ? "InIssuance" : undefined,
        });
        if (dbUpdate.state) {
          const message = dbUpdate.escrowState
            ? "Your program is now active and escrow is ready to issue rewards!"
            : "Your loyalty program is now active!";
          setIsChecked(true);
          toastSuccess(message);
        }
      }

      if (receipt.status === "reverted") {
        toastError("Transaction reverted. Try again later.");
      }
    } catch (error) {
      handleLoyaltyError(error, "Failed to set program to active.");
    }
  };

  return (
    <>
      {confirmOpen && (
        <DashboardSimpleInputModal
          modalTitle="Confirm Begin Program"
          modalDescription="If you are ready to start your program, type 'Confirm' in the box below."
          bannerInfo="This action is irreversible. Make sure you understand the state cycle of your program before continuing."
          inputLabel="Type Confirm below"
          inputState={confirmEntry}
          inputPlaceholder="Type 'Confirm'"
          inputInstruction="Type 'Confirm' in the box below to verify that you are making your program active."
          inputValid={confirmValid}
          inputOnChange={onConfirmChange}
          inputDisabled={false}
          inputHelpMsg="This is an immutable action. Are you sure you wish to proceed?"
          btnTitle="Make Program Active"
          onActionBtnClick={makeProgramActive}
          btnDisabled={!confirmValid}
          setIsModalOpen={closeConfirm}
        />
      )}
      <DashboardContentBox
        title="Activate Loyalty Program"
        titleType="Immutable"
        description="Set your loyalty program to active/start your program. This will begin your program and allow your users to interact with the program. It will also allow your Escrow contract, if applicable, to begin issuing rewards as users progress."
        descriptionTwo="This will write to your smart contract and make an irreversible state change."
        warning="This action is immutable. Once you set your program to active, it will remain active until the end date you specified at contract creation."
        content={
          <DashboardToggleSwitch
            id="start-program-switch"
            checked={isChecked || alreadyActiveProgram}
            disableCheckbox={programState === "Active"}
            disableCheckboxTip="Your program has been set Active. This action cannot be undone."
            onChange={doSetActiveChecksOpenConfirm}
          />
        }
      />
    </>
  );
}
