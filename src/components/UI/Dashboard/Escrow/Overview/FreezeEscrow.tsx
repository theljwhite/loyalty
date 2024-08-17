import { useState } from "react";
import { useRouter } from "next/router";
import { useEscrowAbi } from "~/customHooks/useContractAbi/useContractAbi";
import { useEscrowContractRead } from "~/customHooks/useEscrowContractRead/useEscrowContractRead";
import { api } from "~/utils/api";
import { type EscrowState } from "@prisma/client";
import { waitForTransaction, writeContract } from "wagmi/actions";
import DashboardContentBox from "../../DashboardContentBox";
import DashboardToggleSwitch from "../../DashboardToggleSwitch";
import { toastSuccess, toastError } from "~/components/UI/Toast/Toast";

export default function FreezeEscrow() {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data } = api.escrow.getAllByLoyaltyAddress.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );
  const { escrowType, address: escrowAddress, state } = data?.escrow ?? {};

  const { mutate: updateEscrowState } =
    api.loyaltyPrograms.updateProgramStateOrEscrowState.useMutation();

  const { abi } = useEscrowAbi(escrowType ?? "ERC20");
  const escrowConfig = {
    address: escrowAddress as `0x${string}`,
    abi,
  };
  const { getEscrowState } = useEscrowContractRead(
    escrowAddress ?? "",
    escrowType ?? "ERC20",
  );

  const onToggleSwitch = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const { checked } = e.target;
    setIsChecked(checked);
    setIsDisabled(true);

    try {
      const updateStateTx = await writeContract({
        ...escrowConfig,
        functionName: "emergencyFreeze",
        args: [checked],
      });

      const receipt = await waitForTransaction({
        chainId: data?.chainId ?? 0,
        hash: updateStateTx.hash,
      });

      if (receipt.status === "reverted") throw new Error();

      const contractState = await getEscrowState();

      updateEscrowState({
        loyaltyAddress: String(loyaltyAddress),
        newEscrowState: (contractState as EscrowState) ?? undefined,
      });

      toastSuccess(
        `Successfully ${checked ? "froze" : "unfroze"} escrow state.`,
      );
    } catch (error) {
      toastError("Error writing to contract state. Please try again later.");
    }

    setTimeout(() => {
      setIsDisabled(false);
    }, 8000);
  };

  return (
    <DashboardContentBox
      title="Freeze Escrow"
      description="Freeze your escrow contract. This will prevent users, contract creator, and approved depositors from withdrawing or depositing to your escrow contract."
      descriptionTwo="This will also prevent users from being rewarded tokens as they progress in your loyalty program."
      warning="This will change the state of your escrow contract but is reversible, meaning that you can both freeze and unfreeze."
      content={
        <DashboardToggleSwitch
          id="freeze-escrow-switch"
          checked={isChecked || state === "Frozen"}
          onChange={onToggleSwitch}
          disableCheckbox={isDisabled}
          disableCheckboxTip="Please wait a moment before trying again"
        />
      }
    />
  );
}
