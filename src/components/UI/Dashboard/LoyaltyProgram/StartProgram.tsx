import { useState } from "react";
import { useLoyaltyAbi } from "~/customHooks/useContractAbi/useContractAbi";
import { api } from "~/utils/api";
import { writeContract, waitForTransaction } from "wagmi/actions";
import { toastSuccess, toastLoading, toastError } from "../../Toast/Toast";
import DashboardContentBox from "../DashboardContentBox";
import DashboardToggleSwitch from "../DashboardToggleSwitch";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";

//TODO 4-10 - this is unfinished

interface StartProgramProps {
  loyaltyAddress: string;
}

type SetActiveStatus = "idle" | "loading" | "success" | "error";

export default function StartProgram({ loyaltyAddress }: StartProgramProps) {
  const [status, setStatus] = useState<SetActiveStatus>("idle");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isConfirmValid, setIsConfirmValid] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<string>("");

  const { abi } = useLoyaltyAbi();
  const loyaltyContractConfig = {
    address: "loyaltyAddress" as `0x${string}`,
    abi,
  };

  const { data } = api.loyaltyPrograms.getBasicLoyaltyDataByAddress.useQuery(
    {
      contractAddress: loyaltyAddress,
    },
    { refetchOnWindowFocus: false },
  );
  const programState = data?.state;
  const alreadyActiveProgram = programState === "Active";

  const doSetActiveChecksOpenConfirm = async (): Promise<void> => {
    const rewardType = data?.rewardType;
    if (!data || !programState || !rewardType) setStatus("error");

    if (rewardType === "Points" && programState !== "Idle") setStatus("error");

    if (rewardType !== "Points") {
      const escrowState = data?.escrowState;

      if (!escrowState) setStatus("error");
      if (programState !== "AwaitingEscrowSetup" || escrowState !== "Idle") {
        setStatus("error");
      }
    }

    setIsConfirmOpen(true);
  };

  const makeProgramActive = async (): Promise<void> => {
    toastLoading("Request sent to wallet", true);
    try {
      const setProgramActive = await writeContract({
        ...loyaltyContractConfig,
        functionName: "setLoyaltyProgramActive",
        args: [],
      });
      const receipt = await waitForTransaction({
        chainId: 0, //TODO get chain id from db for this call.
        hash: setProgramActive.hash,
      });

      if (receipt.status === "success") {
        toastSuccess("Your program is now active!");
        setIsChecked(true);
      }

      if (receipt.status === "reverted") {
        toastError("Transaction reverted. Try again later.");
      }
    } catch (error) {
      console.error("error from make active", error);
      //TODO handle error
      toastError("Failed to set program as active. Try again later.");
    }
  };

  const confirmReadyToBegin = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { value } = e.target;
    setConfirm(value);
    const confirmRegex = /^confirm$/i;
    if (confirmRegex.test(value)) setIsConfirmValid(true);
    else setIsConfirmValid(false);
  };

  return (
    <>
      {isConfirmOpen && (
        <DashboardSimpleInputModal
          modalTitle="Confirm Begin Program"
          modalDescription="Confirm that you are ready to make your program active by typing 'Confirm' in the box below."
          bannerInfo="This action is irreversible. Make sure you understand the state cycle of your program before continuing."
          inputLabel="Type Confirm below"
          inputState={confirm}
          inputPlaceholder="Type 'Confirm'"
          inputInstruction="Type 'Confirm' in the box below to verify that you are making your program active."
          inputValid={isConfirmValid}
          inputOnChange={confirmReadyToBegin}
          inputDisabled={false}
          inputHelpMsg="This is an immutable action. Are you sure you wish to proceed?"
          btnTitle="Make Program Active"
          onActionBtnClick={makeProgramActive}
          btnDisabled={!isConfirmValid}
          setIsModalOpen={setIsConfirmOpen}
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
