import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { isAddress } from "ethers";

export const receivedEventBase = z.object({
  loyaltyAddress: z.string().refine(isAddress, "Invalid loyalty address"),
  transactionHash: z.string().length(66),
  userAddress: z.string().refine(isAddress, "Invalid user address"),
  timestamp: z.number().gt(1000000000),
});

export const progressionEventSchema = z.object({
  eventName: z.enum(["ObjectiveCompleted", "PointsUpdate"]),
  pointsChange: z.number().optional(),
  objectiveIndex: z.number().optional(),
  userPointsTotal: z.number(),
  ...receivedEventBase.shape,
});

export const rewardEventSchema = z.object({
  eventName: z.enum(["ERC20Rewarded", "ERC721Rewarded", "ERC1155Rewarded"]),
  escrowType: z.enum(["ERC20", "ERC721", "ERC1155"]),
  tokenId: z.number().optional(),
  tokenAmount: z.number().optional(),
  erc20Amount: z.bigint().optional(),
  ...receivedEventBase.shape,
});

export const eventsRouter = createTRPCRouter({
  createProgressionEvent: protectedProcedure
    .input(progressionEventSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        eventName,
        pointsChange,
        objectiveIndex,
        userPointsTotal,
        loyaltyAddress,
        transactionHash,
        userAddress,
        timestamp,
      } = input;

      const event = await ctx.db.progressionEvent.create({
        data: {
          objectiveIndex: objectiveIndex ?? undefined,
          pointsChange: pointsChange ?? undefined,
          timestamp: new Date(timestamp * 1000),
          userPointsTotal,
          eventName,
          loyaltyAddress,
          transactionHash,
          userAddress,
        },
      });

      return event;
    }),
  createRewardEvent: protectedProcedure
    .input(rewardEventSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        eventName,
        loyaltyAddress,
        transactionHash,
        userAddress,
        timestamp,
        tokenId,
        tokenAmount,
        erc20Amount,
        escrowType,
      } = input;

      const event = await ctx.db.rewardEvent.create({
        data: {
          tokenId: tokenId ?? undefined,
          tokenAmount: tokenAmount ?? undefined,
          erc20Amount: erc20Amount ?? undefined,
          timestamp: new Date(timestamp * 1000),
          escrowType,
          eventName,
          loyaltyAddress,
          transactionHash,
          userAddress,
        },
      });
      return event;
    }),
});
