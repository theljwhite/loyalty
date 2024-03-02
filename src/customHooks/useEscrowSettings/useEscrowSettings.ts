import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { useEscrowSettingsStore } from "./store";
import { useLoyaltyContractRead } from "../useLoyaltyContractRead/useLoyaltyContractRead";
import { writeContract } from "wagmi/actions";
import {
  ERC20RewardCondition,
  ERC721RewardCondition,
  ERC721RewardOrder,
  ERC1155RewardCondition,
} from "./types";
import { type Objective, type Tier } from "@prisma/client";
import {
  MAX_OBJECTIVES_LENGTH,
  MAX_OBJECTIVE_POINTS_VALUE,
} from "~/constants/loyaltyConstants";
import {
  toastLoading,
  toastError,
  toastSuccess,
  dismissToast,
} from "~/components/UI/Toast/Toast";

export default function useEscrowSettings(
  escrowAddress: string,
  loyaltyAddress: string,
) {
  const {
    rewardGoal,
    erc721RewardOrder,
    erc721RewardCondition,
    setIsLoading,
    setIsSuccess,
    setError,
    setIsConfirmModalOpen,
  } = useEscrowSettingsStore((state) => state);

  const { abi: erc20EscrowAbi } = useEscrowAbi("ERC20");
  const { abi: erc721EscrowAbi } = useEscrowAbi("ERC721");
  const { abi: erc1155EscrowAbi } = useEscrowAbi("ERC1155");

  const { getTotalPointsPossible } = useLoyaltyContractRead(loyaltyAddress);

  const setERC721EscrowSettings = async (): Promise<void> => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    toastLoading("Request sent to wallet", true);
    try {
      const setERC721Settings = await writeContract({
        abi: erc721EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettings",
        args: [erc721RewardOrder, erc721RewardCondition, rewardGoal],
      });

      if (setERC721Settings.hash) {
        dismissToast();
        setIsSuccess(true);
        toastSuccess("Successfully set escrow settings");
        setIsLoading(false);
      }
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const validateERC721Settings = async (
    objectives: Objective[],
    tiers: Tier[],
  ): Promise<boolean> => {
    const rewardGoalNum = Number(rewardGoal);

    if (!validERC721Enums()) {
      toastError("You forgot to choose a reward order or condition");
      return false;
    }

    if (erc721RewardCondition === ERC721RewardCondition.ObjectiveCompleted) {
      const objectivesLength = objectives.length;
      if (rewardGoalNum >= objectivesLength) {
        toastError("Must choose a valid objective to use single objective");
        return false;
      }
    }
    if (erc721RewardCondition === ERC721RewardCondition.TierReached) {
      const tiersLength = tiers.length;
      if (rewardGoalNum === 0 || rewardGoalNum >= tiersLength) {
        toastError("Must choose a valid tier to use tier reached");
        return false;
      }
    }
    if (erc721RewardCondition === ERC721RewardCondition.PointsTotal) {
      const totalPointsPossible =
        (await getTotalPointsPossible()) ??
        MAX_OBJECTIVES_LENGTH * MAX_OBJECTIVE_POINTS_VALUE;

      if (rewardGoalNum === 0 || rewardGoalNum > totalPointsPossible) {
        toastError(
          `Must set a points goal between 1 and ${totalPointsPossible}`,
        );
        return false;
      }
    }

    return true;
  };

  const validERC721Enums = (): boolean => {
    let rewardOrderValid: boolean = false;
    let rewardConditionValid: boolean = false;
    if (
      erc721RewardOrder in ERC721RewardOrder &&
      erc721RewardOrder !== ERC721RewardOrder.NotSet
    ) {
      rewardOrderValid = true;
    }
    if (
      erc721RewardCondition in ERC721RewardCondition &&
      erc721RewardCondition !== ERC721RewardCondition.NotSet
    ) {
      rewardConditionValid = true;
    }
    return rewardOrderValid && rewardConditionValid;
  };

  const handleSettingsErrors = (error: Error): void => {
    console.log("error from handle settings errors", error);
    setError(JSON.stringify(error).slice(0, 50));
  };

  return { setERC721EscrowSettings, validateERC721Settings };
}
