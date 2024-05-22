import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { useEscrowSettingsStore } from "./store";
import { useLoyaltyContractRead } from "../useLoyaltyContractRead/useLoyaltyContractRead";
import { useEscrowContractRead } from "../useEscrowContractRead/useEscrowContractRead";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { api } from "~/utils/api";
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
  ERC20_PAYOUT_BUFFER,
  ERC1155_PAYOUT_BUFFER,
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
  const { getERC1155EscrowTokenDetails } = useEscrowContractRead(
    escrowAddress,
    "ERC1155",
  );
  const { mutate: updateEscrowStateDb } =
    api.escrow.updateEscrowState.useMutation();

  const setERC20EscrowSettingsBasic = async (): Promise<void> => {
    handleSetLoadingState();
    try {
      const setSettingsBasic = await writeContract({
        abi: erc20EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettingsBasic",
        args: [erc20RewardCondition, rewardGoal, parseFloat(payoutAmount)],
      });

      const setSettingsReceipt = await waitForTransaction({
        hash: setSettingsBasic.hash,
      });

      if (setSettingsReceipt.status === "success") {
        handleSetSuccessState();
        updateEscrowStateDb({ escrowAddress, newEscrowState: "Idle" });
      }
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const setERC20EscrowSettingsAdvanced = async (): Promise<void> => {
    handleSetLoadingState();
    try {
      const payouts = payoutAmounts
        .split(",")
        .map((amount) => parseFloat(amount));

      const setSettingsAdvanced = await writeContract({
        abi: erc20EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettingsAdvanced",
        args: [erc20RewardCondition, payouts],
      });

      const setSettingsReceipt = await waitForTransaction({
        hash: setSettingsAdvanced.hash,
      });

      if (setSettingsReceipt.status === "success") {
        handleSetSuccessState();
        updateEscrowStateDb({ escrowAddress, newEscrowState: "InIssuance" });
      }
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

      if (setERC721Settings.hash) {
        handleSetSuccessState();
        updateEscrowStateDb({ escrowAddress, newEscrowState: "InIssuance" });
      }
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const setERC1155EscrowSettingsBasic = async (): Promise<void> => {
    handleSetLoadingState();
    try {
      const setERC1155Settings = await writeContract({
        abi: erc1155EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettingsBasic",
        args: [erc1155RewardCondition, rewardTokenId, payoutAmount, rewardGoal],
      });
      if (setERC1155Settings.hash) handleSetSuccessState();
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const setERC1155EscrowSettingsAdvanced = async (): Promise<void> => {
    handleSetLoadingState();
    const tokenIds = rewardTokenIds.split(",");
    const payouts = payoutAmounts.split(",");
    try {
      const setSettingsAdvanced = await writeContract({
        abi: erc1155EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettingsAdvanced",
        args: [erc1155RewardCondition, tokenIds, payouts],
      });
      if (setSettingsAdvanced.hash) handleSetSuccessState();
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const validateERC20PayoutsAndRunEstimate = async (
    tiers: Tier[],
    objectives: Objective[],
  ): Promise<boolean> => {
    const escrowBalance = parseFloat(await getERC20EscrowBalance());
    const payouts = payoutAmounts.split(",");
    const payoutsToNum = payouts.map((amount) => parseFloat(amount));

    if (!validERC20RewardCondition()) {
      toastError("You forgot to choose a reward condition.");
      return false;
    }

    for (const amount of payoutsToNum) {
      if (amount * ERC20_PAYOUT_BUFFER >= escrowBalance) {
        toastError(
          "Insufficient balance to use these amounts. Lower your amounts.",
        );
        return false;
      }
    }

    if (erc20RewardCondition === ERC20RewardCondition.RewardPerObjective) {
      if (objectives.length !== payouts.length) {
        toastError(
          `Payouts length must match amount of objectives: ${objectives.length}`,
        );
        return false;
      }
      const usersEstimate = estimateWorstCaseTotalUsersToReward(
        escrowBalance,
        payouts,
      );
      setPayoutEstimate(
        `With these payouts, in worst case, ${usersEstimate} different users could be rewarded`,
      );
    }

    if (erc20RewardCondition === ERC20RewardCondition.RewardPerTier) {
      if (tiers.length !== payouts.length) {
        toastError(
          `Payouts length must match amount of tiers: ${tiers.length}`,
        );
        return false;
      }

      const usersEstimate = estimateAllTiersUsersToReward(
        escrowBalance,
        payouts,
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

    if (!validERC20RewardCondition()) {
      toastError("You forgot to choose a reward condition");
      return false;
    }

    if (payout * ERC20_PAYOUT_BUFFER >= escrowBalance) {
      toastError(
        "Insufficient balance to reward this amount. Use a lower amount.",
      );
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

    if (!validERC721RewardCondition()) {
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

  const validateERC1155Advanced = async (
    objectives: Objective[],
    tiers: Tier[],
  ): Promise<boolean> => {
    if (!validERC1155RewardCondition()) {
      toastError("You forgot to choose a reward condition");
      return false;
    }

    const erc1155EscrowDetails = await getERC1155EscrowTokenDetails();
    const escrowBalance = erc1155EscrowDetails?.tokens.map((tkn) => ({
      id: Number(tkn.id),
      value: Number(tkn.value),
    }));

    const tokenIdsEntry = rewardTokenIds.split(",");
    const tokenIdsEntryNum = tokenIdsEntry.map((tkn) => Number(tkn));
    const payouts = payoutAmounts.split(",").map((amount) => Number(amount));

    if (tokenIdsEntry.length !== payouts.length) {
      toastError("Token ids and amounts must be the same length");
      return false;
    }

    if (
      erc1155RewardCondition === ERC1155RewardCondition.EachObjective &&
      objectives.length !== payouts.length
    ) {
      toastError(
        `Token ids and amounts should correspond to each of your ${objectives.length} objectives`,
      );
      return false;
    }

    if (
      erc1155RewardCondition === ERC1155RewardCondition.EachTier &&
      tiers.length !== payouts.length
    ) {
      toastError(
        `Token ids and amounts should correspond to each of your ${tiers.length} tiers.`,
      );
      return false;
    }

    const validPayouts = validateERC1155PayoutsWithBalance(
      tokenIdsEntryNum,
      payouts,
      escrowBalance ?? [],
    );

    if (!validPayouts) return false;

    return true;
  };

  const validateERC1155Basic = async (): Promise<boolean> => {
    if (!validERC1155RewardCondition()) {
      toastError("You forgot to choose a reward condition");
      return false;
    }

    const erc1155EscrowDetails = await getERC1155EscrowTokenDetails();
    const escrowBalance = erc1155EscrowDetails?.tokens.map((tkn) => ({
      id: Number(tkn.id),
      value: Number(tkn.value),
    }));

    const validPayouts = validateERC1155PayoutsWithBalance(
      [Number(rewardTokenId)],
      [Number(payoutAmount)],
      escrowBalance ?? [],
    );

    if (!validPayouts) return false;

    return true;
  };

  const validateERC1155PayoutsWithBalance = (
    tokenIdsEntry: number[],
    payouts: number[],
    escrowBalance: { id: number; value: number }[],
  ): boolean => {
    const tokenIdAmounts: Record<string, number> = {};

    const isValidTokenIds = tokenIdsEntry.every(
      (tokenId) => escrowBalance?.some((bal) => bal.id === tokenId),
    );

    if (!isValidTokenIds) {
      toastError("You entered a token id that is not in your escrow balance");
      return false;
    }

    const payoutContainsZero = payouts.some((amount) => amount === 0);

    if (payoutContainsZero) {
      toastError("Payout amounts must all be greater than 0");
      return false;
    }

    tokenIdsEntry.forEach((tokenId, index) => {
      tokenIdAmounts[String(tokenId)] =
        (tokenIdAmounts[String(tokenId)] ?? 0) + payouts[index]!;
    });

    for (const tokenId in tokenIdAmounts) {
      const totalPayout = tokenIdAmounts[tokenId]!;
      const escrowBalanceForToken = escrowBalance.find(
        (bal) => bal.id === Number(tokenId),
      );

      if (
        !escrowBalanceForToken ||
        totalPayout * ERC1155_PAYOUT_BUFFER > escrowBalanceForToken.value
      ) {
        toastError(
          `Insufficient balance for a token, id # ${tokenId}. Escrow balance is ${escrowBalanceForToken?.value} and you are attempting to reward ${totalPayout} overall. Lower the amounts for this token so that the total rewarded is ${ERC1155_PAYOUT_BUFFER} times less than the escrow balance so that multiple users can be rewarded.`,
        );
        return false;
      }
    }

    return true;
  };

  const validERC20RewardCondition = (): boolean => {
    if (
      erc20RewardCondition in ERC20RewardCondition &&
      erc20RewardCondition !== ERC20RewardCondition.NotSet
    ) {
      return true;
    }
    return false;
  };

  const validERC721RewardCondition = (): boolean => {
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
    console.log("error", error);
    //TODO - error handle escrow settings
    let toastErrorMessage: string = "";
    const errorMessage = error.message.toLowerCase();
    const errorCause = String(error.cause);
    dismissToast();
    setIsLoading(false);
    if (errorMessage.includes("user rejected the request")) {
      toastErrorMessage = "You rejected the wallet request";
    }
    if (errorCause.includes("DepositPeriodMustBeFinished()")) {
      toastErrorMessage =
        "Cannot set escrow settings. Either your deposit period is still active, or you have already set escrow settings before.";
    }
    setError(JSON.stringify(error).slice(0, 50));
    toastError(toastErrorMessage);
  };

  return {
    setERC20EscrowSettingsBasic,
    setERC20EscrowSettingsAdvanced,
    setERC721EscrowSettings,
    setERC1155EscrowSettingsBasic,
    setERC1155EscrowSettingsAdvanced,
    validateERC20PayoutsAndRunEstimate,
    validateERC20SinglePayoutAndEstimate,
    validateERC721Settings,
    validateERC1155Basic,
    validateERC1155Advanced,
  };
}
