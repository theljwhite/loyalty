import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { isAddress } from "ethers";
import { TRPCError } from "@trpc/server";

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

      if (
        (pointsChange && objectiveIndex) ||
        (!pointsChange && !objectiveIndex)
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

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

      if ((tokenAmount && erc20Amount) || (!tokenAmount && !erc20Amount)) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

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
  getAllProgEventsByUser: protectedProcedure
    .input(z.object({ userAddress: z.string(), loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userAddress, loyaltyAddress } = input;
      const userProgEvents = await ctx.db.progressionEvent.findMany({
        where: { userAddress, loyaltyAddress },
      });

      return userProgEvents;
    }),
  getAllRewardEventsByUser: protectedProcedure
    .input(z.object({ userAddress: z.string(), loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userAddress, loyaltyAddress } = input;

      const userRewardEvents = await ctx.db.rewardEvent.findMany({
        where: { userAddress, loyaltyAddress },
      });

      return userRewardEvents;
    }),
  getOnlyObjectiveEvents: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const objectiveEvents = await ctx.db.progressionEvent.findMany({
        where: {
          loyaltyAddress: input.loyaltyAddress,
          objectiveIndex: { not: null },
          pointsChange: null,
        },
      });
      return objectiveEvents;
    }),
  getOnlyPointsUpdateEvents: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const pointsUpdateEvents = await ctx.db.progressionEvent.findMany({
        where: {
          loyaltyAddress: input.loyaltyAddress,
          pointsChange: { not: null },
          objectiveIndex: null,
        },
      });
      return pointsUpdateEvents;
    }),

  getCompletionCountForEachObjective: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      //TEMP this is probably temporary
      //even tho temp, there may also be a way to do this directly with prisma and no post process.
      //this is also wonky for some reason cause the prisma query casts progressionEvents,
      //as {objectiveIndex: number | null}[] even after the "not null" is used.
      //i'll fix it, but it isnt important right now. for now the generic works.

      const progressionEvents = (await ctx.db.progressionEvent.findMany({
        where: {
          loyaltyAddress: input.loyaltyAddress,
          objectiveIndex: { not: null },
        },
        select: { objectiveIndex: true },
      })) as { objectiveIndex: number }[];

      type ObjectiveCompletions = { [key: number]: number };

      const objInteractions = progressionEvents.reduce<ObjectiveCompletions>(
        (prev, curr) => {
          const objIndex = curr.objectiveIndex;
          return (
            prev[objIndex] ? ++prev[objIndex] : (prev[objIndex] = 1), prev, prev
          );
        },
        {},
      );

      return objInteractions;
    }),
  getCompletionsByObjective: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string(), objectiveIndex: z.number() }))
    .query(async ({ ctx, input }) => {
      const objectiveEvents = await ctx.db.progressionEvent.findMany({
        where: {
          loyaltyAddress: input.loyaltyAddress,
          objectiveIndex: input.objectiveIndex,
        },
        select: { userAddress: true, transactionHash: true, timestamp: true },
      });
      return objectiveEvents;
    }),
  getTopUsersFromEvents: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string(), limit: z.number().max(25) }))
    .query(async ({ ctx, input }) => {
      //TEMP: possibly temporary and experimental.
      //the smart contracts, when they emit events, are set up to
      //return the user's updated points total stored in the contracts.
      //so the users' most recent events will contain their up to date points total.

      const { loyaltyAddress, limit } = input;

      const topUsers = await ctx.db.$queryRaw<
        { userAddress: string; userPointsTotal: number }[]
      >`
      WITH LatestEvents AS (
        SELECT 
          userAddress, 
          userPointsTotal,
          ROW_NUMBER() OVER (PARTITION BY userAddress ORDER BY timestamp DESC) as rn
        FROM 
          "ProgressionEvent"
        WHERE 
          loyaltyAddress = ${loyaltyAddress}
      )
      SELECT 
        userAddress, 
        userPointsTotal
      FROM 
        LatestEvents
      WHERE 
        rn = 1
      ORDER BY 
        userPointsTotal DESC
      LIMIT ${limit}
      `;

      return topUsers;
    }),
});