import { useState } from "react";
import { useEscrowAbi, useLoyaltyAbi } from "../useContractAbi/useContractAbi";
import {
  writeContract,
  readContract,
  waitForTransaction,
  fetchToken,
} from "wagmi/actions";
import { formatUnits } from "ethers";
import { type EscrowType } from "@prisma/client";

export function useContractProgression(
  loyaltyAddress: string,
  chainId: number,
  escrowAddress?: string,
  escrowType?: EscrowType,
) {
  const [erc20Balance, setERC20Balance] = useState<string>("");
  const [erc721Balance, setERC721Balance] = useState<number[]>([]);
  const [erc1155Balance, setERC1155Balance] = useState<
    { tokenId: number; amount: bigint }[]
  >([]);

  const { abi: loyaltyAbi } = useLoyaltyAbi();
  const { abi: escrowAbi } = useEscrowAbi(escrowType ?? "ERC20");

  const loyaltyConfig = {
    address: loyaltyAddress as `0x${string}`,
    abi: loyaltyAbi,
    chainId,
  };

  const escrowConfig = {
    address: escrowAddress as `0x${string}`,
    abi: escrowAbi,
    chainId,
  };

  const completeCreatorAuthorityObjective = async (
    userAddress: string,
    objectiveIndex: number,
  ): Promise<boolean> => {
    const tx = await writeContract({
      ...loyaltyConfig,
      functionName: "completeCreatorAuthorityObjective",
      args: [objectiveIndex, userAddress],
    });

    const receipt = await waitForTransaction({ chainId, hash: tx.hash });

    return receipt.status === "success";
  };

  const completeUserAuthorityObjective = async (
    userAddress: string,
    objectiveIndex: number,
  ): Promise<boolean> => {
    const tx = await writeContract({
      ...loyaltyConfig,
      functionName: "completeUserAuthorityObjective",
      args: [objectiveIndex, userAddress],
    });

    const receipt = await waitForTransaction({ chainId, hash: tx.hash });
    return receipt.status === "success";
  };

  const givePointsToUser = async (
    userAddress: string,
    pointsAmount: number,
  ): Promise<boolean> => {
    const tx = await writeContract({
      ...loyaltyConfig,
      functionName: "givePointsToUser",
      args: [userAddress, pointsAmount],
    });

    const receipt = await waitForTransaction({ chainId, hash: tx.hash });
    return receipt.status === "success";
  };

  const deductPointsFromUser = async (
    userAddress: string,
    pointsAmount: number,
  ): Promise<boolean> => {
    const tx = await writeContract({
      ...loyaltyConfig,
      functionName: "deductPointsFromUser",
      args: [userAddress, pointsAmount],
    });

    const receipt = await waitForTransaction({ chainId, hash: tx.hash });

    return receipt.status === "success";
  };

  const getUserProgression = async (
    userAddress: string,
  ): Promise<{
    points: number;
    currentTier: number;
  }> => {
    const progression = (await readContract({
      ...loyaltyConfig,
      functionName: "getUserProgression",
      args: [userAddress],
    })) as bigint[];

    return {
      points: Number(progression[0]),
      currentTier: Number(progression[1]),
    };
  };

  const getUserCompletedObjectives = async (
    userAddress: string,
  ): Promise<boolean[]> => {
    const userCompletedObjectives = (await readContract({
      ...loyaltyConfig,
      functionName: "getUserCompletedObjectives",
      args: [userAddress],
    })) as boolean[];

    return userCompletedObjectives;
  };

  const getUserObjectivesCompleteCount = async (
    userAddress: string,
  ): Promise<number> => {
    const completedCount = await readContract({
      ...loyaltyConfig,
      functionName: "getUserObjectivesCompleteCount",
      args: [userAddress],
    });

    return Number(completedCount);
  };

  const getUserRewardsERC20 = async (
    userAddress: string,
  ): Promise<{
    rawBalance: bigint;
    amountToDecimals?: string;
    name?: string;
    symbol?: string;
  }> => {
    const userERC20Balance = (await readContract({
      ...escrowConfig,
      functionName: "lookupUserBalance",
      args: [userAddress],
      account: process.env.NEXT_PUBLIC_LOTTA_CONTRACT_ADDRESS as `0x${string}`,
    })) as unknown as bigint;

    const rewardTokenAddress = (await readContract({
      ...escrowConfig,
      functionName: "rewardTokenAddress",
      args: [],
    })) as unknown as `0x${string}`;

    const rewardToken = await fetchToken({
      address: rewardTokenAddress,
      chainId,
    });

    const amountToDecimals = formatUnits(
      userERC20Balance,
      rewardToken.decimals,
    );

    setERC20Balance(amountToDecimals);

    return {
      rawBalance: userERC20Balance,
      amountToDecimals,
      name: rewardToken.name,
      symbol: rewardToken.symbol,
    };
  };

  const getUserRewardsERC721 = async (
    userAddress: string,
  ): Promise<number[]> => {
    const userTokenBalance = await readContract({
      ...escrowConfig,
      functionName: "getUserAccount",
      args: [userAddress],
    });
    const userTokenBalanceNum = userTokenBalance.map((item) => Number(item));

    setERC721Balance(userTokenBalanceNum);
    return userTokenBalanceNum;
  };

  const getUserRewardsERC1155 = async (
    userAddress: string,
  ): Promise<{ tokenId: number; amount: bigint }[]> => {
    const userTokenBalance = await readContract({
      ...escrowConfig,
      functionName: "getUserRewards",
      args: [userAddress],
    });

    const formattedBalance = userTokenBalance.map((item) => ({
      tokenId: Number(item.tokenId),
      amount: item.amount,
    }));
    setERC1155Balance(formattedBalance);
    return formattedBalance;
  };

  const getUserRewards = async (userAddress: string): Promise<void> => {
    if (escrowType === "ERC20") await getUserRewardsERC20(userAddress);
    if (escrowType === "ERC721") await getUserRewardsERC721(userAddress);
    if (escrowType === "ERC1155") await getUserRewardsERC1155(userAddress);
  };

  return {
    erc20Balance,
    erc721Balance,
    erc1155Balance,
    completeCreatorAuthorityObjective,
    completeUserAuthorityObjective,
    givePointsToUser,
    deductPointsFromUser,
    getUserProgression,
    getUserCompletedObjectives,
    getUserObjectivesCompleteCount,
    getUserRewards,
    getUserRewardsERC20,
    getUserRewardsERC721,
    getUserRewardsERC1155,
  };
}
