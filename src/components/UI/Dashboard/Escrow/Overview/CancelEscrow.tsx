import { useState } from "react";
import { useRouter } from "next/router";
import { useEscrowAbi } from "~/customHooks/useContractAbi/useContractAbi";
import { api } from "~/utils/api";
import { writeContract, waitForTransaction } from "wagmi/actions";
import useConfirmAction from "~/customHooks/useConfirmAction";
import DashboardContentBox from "../../DashboardContentBox";
import DashboardToggleSwitch from "../../DashboardToggleSwitch";
import DashboardSimpleInputModal from "../../DashboardSimpleInputModal";
import {
  toastError,
  toastSuccess,
  toastLoading,
} from "~/components/UI/Toast/Toast";

//TODO - logic to redirect dashboard after escrow is canceled

export default function CancelEscrow() {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const {
    confirmEntry,
    confirmOpen,
    confirmValid,
    setConfirmOpen,
    onConfirmChange,
    closeConfirm,
  } = useConfirmAction();

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { mutateAsync: updateEscrowState } =
    api.loyaltyPrograms.updateProgramStateOrEscrowState.useMutation();

  const { data } = api.escrow.getAllByLoyaltyAddress.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );

  const { address: escrowAddress, state, escrowType } = data?.escrow ?? {};

  const { abi } = useEscrowAbi(escrowType ?? "ERC20");
  const escrowConfig = {
    address: escrowAddress as `0x${string}`,
    abi,
  };

  const cancelEscrow = async (): Promise<void> => {
    closeConfirm();
    toastLoading("Request sent to wallet", true);

    try {
      const setEscrowCancelled = await writeContract({
        ...escrowConfig,
        functionName: "cancelProgramEscrow",
        args: [],
      });
      const receipt = await waitForTransaction({
        chainId: data?.chainId ?? 0,
        hash: setEscrowCancelled.hash,
      });

      if (receipt.status === "reverted") throw new Error();

      const dbUpdate = await updateEscrowState({
        loyaltyAddress: String(loyaltyAddress),
        newEscrowState: "Canceled",
      });

      if (dbUpdate.state) {
        toastSuccess("Successfully canceled your escrow contract.");
        setIsChecked(true);
      }
    } catch (error) {
      toastError("Error canceling escrow contract. Please try again later.");
    }
  };

  return (
    <>
      {confirmOpen && (
        <DashboardSimpleInputModal
          modalTitle="Confirm Cancel Escrow"
          modalDescription="If you intend on canceling your escrow contract, type 'Confirm' in the box below."
          bannerInfo="This action is irreversible. Make sure you understand the state cycle of your program before continuing."
          inputLabel="Type Confirm below"
          inputOnChange={onConfirmChange}
          inputInstruction="Type 'Confirm' in the box below to verify that you intend on canceling your escrow contract."
          inputDisabled={false}
          inputValid={confirmValid}
          inputState={confirmEntry}
          inputPlaceholder="Type 'Confirm'"
          inputHelpMsg="This is an immutable action. Are you sure you wish to proceed?"
          onActionBtnClick={cancelEscrow}
          btnTitle="Cancel Escrow"
          btnDisabled={!confirmValid}
          setIsModalOpen={closeConfirm}
        />
      )}
      <DashboardContentBox
        title="Cancel Escrow"
        titleType="Immutable"
        description="Cancel your escrow contract. Your loyalty program contract will remain as it is, but escrow will be permanently canceled."
        descriptionTwo="Once canceled, your users and contract creator will be able to withdraw any remaining funds, but rewards for user progression will be ceased."
        warning="This action is immutable. Once your escrow contract is canceled, it is permanent."
        content={
          <DashboardToggleSwitch
            id="cancel-escrow-switch"
            checked={isChecked || state === "Canceled"}
            onChange={() => setConfirmOpen(true)}
            disableCheckbox={isChecked || state === "Canceled"}
            disableCheckboxTip="Your escrow contract has already been canceled. This action cannot be undone."
          />
        }
      />
    </>
  );
}
