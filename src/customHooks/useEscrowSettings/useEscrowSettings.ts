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
import { useEscrowContractRead } from "../useEscrowContractRead/useEscrowContractRead";

export default function useEscrowSettings(
  escrowAddress: string,
  loyaltyAddress: string,
) {
  const {
    rewardGoal,
    erc721RewardOrder,
    erc721RewardCondition,
    erc20RewardCondition,
    erc1155RewardCondition,
    rewardTokenId,
    rewardTokenIds,
    payoutAmount,
    payoutAmounts,
    setIsLoading,
    setIsSuccess,
    setError,
    setIsConfirmModalOpen,
    setPayoutEstimate,
  } = useEscrowSettingsStore((state) => state);

  const { abi: erc20EscrowAbi } = useEscrowAbi("ERC20");
  const { abi: erc721EscrowAbi } = useEscrowAbi("ERC721");
  const { abi: erc1155EscrowAbi } = useEscrowAbi("ERC1155");

  const { getTotalPointsPossible } = useLoyaltyContractRead(loyaltyAddress);
  const { getERC20EscrowBalance } = useEscrowContractRead(
    escrowAddress,
    "ERC20",
  );

  const setERC20EscrowSettingsBasic = async (): Promise<void> => {
    handleSetLoadingState();
    try {
      const setSettingsBasic = await writeContract({
        abi: erc20EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettingsBasic",
        args: [erc20RewardCondition, rewardGoal, payoutAmount],
      });

      if (setSettingsBasic.hash) handleSetSuccessState;
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const setERC20EscrowSettingsAdvanced = async (): Promise<void> => {
    handleSetLoadingState();
    try {
      const setSettingsAdvanced = await writeContract({
        abi: erc20EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettingsAdvanced",
        args: [erc20RewardCondition, payoutAmounts],
      });
      if (setSettingsAdvanced.hash) handleSetSuccessState();
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const setERC721EscrowSettings = async (): Promise<void> => {
    handleSetLoadingState();
    try {
      const setERC721Settings = await writeContract({
        abi: erc721EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettings",
        args: [erc721RewardOrder, erc721RewardCondition, rewardGoal],
      });

      if (setERC721Settings.hash) handleSetSuccessState();
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const validateERC20PayoutsAndRunEstimate = async (
    tiers: Tier[],
    objectives: Objective[],
  ): Promise<boolean> => {
    const escrowBalance = parseFloat(await getERC20EscrowBalance());
    const payoutAmounts = payoutAmount.split(",");

    if (erc20RewardCondition === ERC20RewardCondition.RewardPerObjective) {
      if (objectives.length !== payoutAmounts.length) {
        toastError("Payouts length must match amount of objectives");
        return false;
      }
      const usersEstimate = estimateWorstCaseTotalUsersToReward(
        escrowBalance,
        payoutAmounts,
      );
      setPayoutEstimate(
        `With these payouts, in worst case, ${usersEstimate} different users could be rewarded`,
      );
    }

    if (erc20RewardCondition === ERC20RewardCondition.RewardPerTier) {
      if (tiers.length !== payoutAmounts.length) {
        toastError("Payouts length must match amount of tiers");
        return false;
      }

      const usersEstimate = estimateAllTiersUsersToReward(
        escrowBalance,
        payoutAmounts,
      );
      setPayoutEstimate(
        `With these payouts, ${usersEstimate} different users could be rewarded for reaching furthest tier`,
      );
    }
    return true;
  };

  const validateERC20SinglePayoutAndEstimate = async (): Promise<boolean> => {
    const escrowBalance = parseFloat(await getERC20EscrowBalance());
    const payout = parseFloat(payoutAmount);
    if (escrowBalance >= payout) {
      toastError("Insufficient balance to reward this amount");
      return false;
    }
    const maxUsersToReward = escrowBalance / payout;
    setPayoutEstimate(
      `With this payout, you could reward ${maxUsersToReward} for completion`,
    );

    return true;
  };

  const estimateWorstCaseTotalUsersToReward = (
    escrowBalance: number,
    payoutAmounts: string[],
  ): number => {
    const usersPerIndex = payoutAmounts.map((amount) =>
      Math.floor(escrowBalance / parseFloat(amount)),
    );
    const weakestIndexUsers = Math.min(...usersPerIndex);
    return weakestIndexUsers;
  };

  const estimateAllTiersUsersToReward = (
    escrowBalance: number,
    payoutAmounts: string[],
  ): number => {
    const totalPayouts = payoutAmounts.reduce(
      (total, payout) => total + parseFloat(payout),
      0,
    );
    const estimatedUsers = Math.floor(escrowBalance / totalPayouts);
    return estimatedUsers;
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

  const validERC1155RewardCondition = (): boolean => {
    let isValid: boolean = false;
    if (
      erc1155RewardCondition in ERC1155RewardCondition &&
      erc1155RewardCondition !== ERC1155RewardCondition.NotSet
    ) {
      isValid = true;
    }
    return isValid;
  };

  const handleSetLoadingState = (): void => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    toastLoading("Request sent to wallet", true);
  };

  const handleSetSuccessState = (): void => {
    dismissToast();
    setIsSuccess(true);
    toastSuccess("Successfully set escrow settings");
    setIsLoading(false);
  };

  const handleSettingsErrors = (error: Error): void => {
    console.log("error from handle settings errors", error);
    setError(JSON.stringify(error).slice(0, 50));
  };

  return {
    setERC20EscrowSettingsBasic,
    setERC20EscrowSettingsAdvanced,
    validateERC20PayoutsAndRunEstimate,
    validateERC20SinglePayoutAndEstimate,
    setERC721EscrowSettings,
    validateERC721Settings,
  };
}
