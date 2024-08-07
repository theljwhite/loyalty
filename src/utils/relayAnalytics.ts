import { bigint, z } from "zod";
import {
  rewardEventUpdateInputSchema,
  progressionEventUpdateInputSchema,
} from "~/server/api/routers/analytics";
import {
  progressionEventSchema,
  rewardEventSchema,
  walletEscrowEventSchema,
} from "~/server/api/routers/events";
import { db } from "~/server/db";
import { fetchToken } from "wagmi/actions";

//TODO - some of these db calls can be optimized

export const createProgressionEvent = async (
  input: z.infer<typeof progressionEventSchema>,
): Promise<typeof event> => {
  const {
    eventName,
    pointsUpdate,
    objectiveIndex,
    userPointsTotal,
    loyaltyAddress,
    transactionHash,
    userAddress,
    timestamp,
  } = input;

  const event = await db.progressionEvent.create({
    data: {
      objectiveIndex,
      pointsChange: pointsUpdate,
      timestamp: new Date(Number(timestamp) * 1000),
      userPointsTotal,
      eventName,
      loyaltyAddress: loyaltyAddress?.toLowerCase() ?? "",
      transactionHash,
      userAddress: userAddress.toLowerCase(),
    },
  });

  return event;
};

export const createRewardEvent = async (
  input: z.infer<typeof rewardEventSchema>,
): Promise<typeof event> => {
  const {
    escrowAddress,
    eventName,
    transactionHash,
    userAddress,
    timestamp,
    tokenId,
    tokenAmount,
    erc20Amount,
    escrowType,
  } = input;

  //TODO - this first call wont be needed as LP address can also be emitted by
  //escrow contract event as one way to avoid this additional call
  const program = await db.loyaltyProgram.findUnique({
    where: { escrowAddress: escrowAddress.toLowerCase() },
    select: { address: true },
  });

  const event = await db.rewardEvent.create({
    data: {
      tokenId: tokenId,
      tokenAmount,
      erc20Amount,
      timestamp: new Date(Number(timestamp) * 1000),
      escrowType,
      eventName,
      loyaltyAddress: program?.address.toLowerCase() ?? "",
      transactionHash,
      userAddress: userAddress.toLowerCase(),
    },
  });
  return event;
};

export const createWalletEvent = async (
  input: z.infer<typeof walletEscrowEventSchema>,
): Promise<typeof event> => {
  const {
    escrowAddress,
    eventName,
    transactionHash,
    userAddress,
    timestamp,
    tokenId,
    tokenAmount,
    erc20Amount,
    erc721Batch,
    erc1155Batch,
  } = input;

  const program = await db.loyaltyProgram.findUnique({
    where: { escrowAddress },
    select: { address: true },
  });

  const event = await db.walletEscrowEvent.create({
    data: {
      timestamp: new Date(timestamp * 1000),
      transactorAddress: userAddress,
      eventName,
      loyaltyAddress: program?.address.toLowerCase() ?? "",
      transactionHash,
      tokenId,
      tokenAmount,
      erc20Amount,
      erc721Batch,
      erc1155Batch,
    },
  });
  return event;
};

export const updateTotalsFromProgressionEvents = async (
  input: z.infer<typeof progressionEventUpdateInputSchema>,
): Promise<void> => {
  const { eventName, userAddress, loyaltyAddress, timestamp } = input;

  const isObjectiveEvent = eventName === "ObjectiveCompleted";

  await db.$transaction(async (tx) => {
    const userProgEventsCount = await tx.progressionEvent.count({
      where: {
        loyaltyAddress,
        userAddress: userAddress.toLowerCase(),
        timestamp: { lt: new Date(Number(timestamp) * 1000) },
      },
    });

    let returningUsersIncrement = 0;
    let totalUniqueUsersIncrement = 0;

    if (userProgEventsCount === 0) totalUniqueUsersIncrement = 1;
    if (userProgEventsCount === 1) returningUsersIncrement = 1;

    await tx.programAnalyticsSummary.update({
      where: { loyaltyAddress: loyaltyAddress.toLowerCase() },
      data: {
        totalUniqueUsers: { increment: totalUniqueUsersIncrement },
        returningUsers: { increment: returningUsersIncrement },
        totalObjectivesCompleted: isObjectiveEvent
          ? { increment: 1 }
          : undefined,
      },
    });
  });
};

export const updateTotalsFromRewardEvents = async (
  input: z.infer<typeof rewardEventUpdateInputSchema>,
): Promise<void> => {
  const { eventName, userAddress, loyaltyAddress, chainId, timestamp, topics } =
    input;
  const { erc20Amount, tokenAmount, tokenId } = topics;

  const isERC20Event = eventName === "ERC20Rewarded" && erc20Amount;
  const isERC721Event = eventName === "ERC721Rewarded" && !tokenAmount;
  const isERC1155Event =
    eventName === "ERC1155Rewarded" && tokenAmount && tokenId;

  await db.$transaction(async (tx) => {
    const userRewardEventsCount = await tx.rewardEvent.count({
      where: {
        loyaltyAddress,
        userAddress: userAddress.toLowerCase(),
        timestamp: { lt: new Date(Number(timestamp) * 1000) },
      },
    });

    const totalUniqueRewardedIncrement = userRewardEventsCount === 0 ? 1 : 0;

    const unclaimedTokensIncrement = isERC721Event
      ? 1
      : isERC1155Event
        ? tokenAmount
        : 0;

    let erc20AmountToContractDecimals = 0;

    //these erc20 escrow specific calls can also prob be avoided/optimized
    if (isERC20Event) {
      const erc20Escrow = await db.escrow.findUnique({
        where: { loyaltyAddress },
        select: { rewardAddress: true },
      });

      const rewardToken = await fetchToken({
        address: loyaltyAddress as `0x${string}`,
        chainId,
      });

      //TODO 7/29 finish this - bigint may not be good enough
    }

    await tx.programAnalyticsSummary.update({
      where: { loyaltyAddress },
      data: {
        totalUniqueRewarded: { increment: totalUniqueRewardedIncrement },
        totalUnclaimedERC20: isERC20Event
          ? { increment: erc20Amount }
          : undefined,
        totalUnclaimedTokens: { increment: unclaimedTokensIncrement },
      },
    });
  });
};

export const updateTotalsFromWithdrawEvents = async (
  input: z.infer<typeof walletEscrowEventSchema>,
): Promise<number> => {
  const { loyaltyAddress, eventName, erc20Amount, erc1155Batch } = input;

  let totalUserWithdrawnIncrement = 0;

  if (eventName === "ERC1155UserWithdrawAll") {
    //TODO maybe track amounts with tkn ids too for erc1155
    totalUserWithdrawnIncrement = erc1155Batch?.tokenIds.length ?? 0;
  }

  if (eventName === "ERC721UserWithdraw") totalUserWithdrawnIncrement = 1;

  const update = await db.programAnalyticsSummary.update({
    where: { loyaltyAddress },
    data: {
      ...(totalUserWithdrawnIncrement > 0 && {
        totalTokensWithdrawn: totalUserWithdrawnIncrement,
      }),
      ...(erc20Amount && { totalERC20Withdrawn: erc20Amount }),
    },
  });
  return update.totalTokensWithdrawn;
};
