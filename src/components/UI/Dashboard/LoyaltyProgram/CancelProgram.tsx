import { useState } from "react";
import { api } from "~/utils/api";
import useConfirmAction from "~/customHooks/useConfirmAction";
import { useLoyaltyAbi } from "~/customHooks/useContractAbi/useContractAbi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import DashboardContentBox from "../DashboardContentBox";
import DashboardToggleSwitch from "../DashboardToggleSwitch";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";
import { toastError, toastLoading, toastSuccess } from "../../Toast/Toast";

interface CancelProgramProps {
  loyaltyAddress: string;
}

export default function CancelProgram({ loyaltyAddress }: CancelProgramProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const { mutateAsync: updateDbProgramState } =
    api.loyaltyPrograms.updateProgramStateOrEscrowState.useMutation();

  const { data: program } =
    api.loyaltyPrograms.getBasicLoyaltyDataByAddress.useQuery(
      {
        contractAddress: loyaltyAddress,
      },
      {
        refetchOnWindowFocus: false,
      },
    );

  const { abi } = useLoyaltyAbi();
  const loyaltyContractConfig = {
    address: loyaltyAddress as `0x${string}`,
    abi,
  };

  const {
    confirmEntry,
    confirmValid,
    confirmOpen,
    onConfirmChange,
    closeConfirm,
    setConfirmOpen,
  } = useConfirmAction();

  const cancelProgram = async (): Promise<void> => {
    closeConfirm();
    toastLoading("Request sent to wallet.", true);

    try {
      const setProgramCancelled = await writeContract({
        ...loyaltyContractConfig,
        functionName: "cancelProgram",
        args: [],
      });

      const receipt = await waitForTransaction({
        chainId: program?.chainId ?? 0,
        hash: setProgramCancelled.hash,
      });

      if (receipt.status === "reverted") throw new Error();

      const dbUpdate = await updateDbProgramState({
        loyaltyAddress,
        newProgramState: "Canceled",
      });

      if (dbUpdate.state) {
        toastSuccess("Successfully canceled your loyalty program.");
        setIsChecked(true);
      }
    } catch (error) {
      toastError(
        "Error canceling loyalty program contract. Please try again later.",
      );
    }
  };

  return (
    <>
      {confirmOpen && (
        <DashboardSimpleInputModal
          modalTitle="Confirm Cancel Program"
          modalDescription="If you intend on canceling your loyaly program, type 'Confirm' in the box below."
          bannerInfo="This action is irreversible. Make sure you understand the state cycle of your program before continuing."
          inputLabel="Type Confirm below"
          inputOnChange={onConfirmChange}
          inputInstruction="Type 'Confirm' in the box below to verify that you intend on canceling your program."
          inputDisabled={false}
          inputValid={confirmValid}
          inputState={confirmEntry}
          inputPlaceholder="Type 'Confirm'"
          inputHelpMsg="This is an immutable action. Are you sure you wish to proceed?"
          onActionBtnClick={cancelProgram}
          btnTitle="Cancel Loyalty Program"
          btnDisabled={!confirmValid}
          setIsModalOpen={closeConfirm}
        />
      )}
      <DashboardContentBox
        title="Cancel Program"
        titleType="Immutable"
        description="Cancel your loyalty program. Existing escrow rewards will be able to be withdrawn by users, as well as any remaining unrewarded escrow balance."
        descriptionTwo="However, once cancelled, your loyalty program contract will no longer track progress. Once your program has been cancelled, it is permanent and cannot be undone."
        content={
          <DashboardToggleSwitch
            id="cancel-program-switch"
            onChange={() => setConfirmOpen(true)}
            checked={isChecked || program?.state === "Canceled"}
            disableCheckbox={isChecked || program?.state === "Canceled"}
            disableCheckboxTip="Your program has already been canceled. This action cannot be undone."
          />
        }
      />
    </>
  );
}
