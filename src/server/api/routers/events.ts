import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { isAddress } from "ethers";

//TODO 6/7 - move zod schemas to separate file?

export const walletEventNameShape = z.enum([
  "ERC20UserWithdraw",
  "ERC20CreatorWithdraw",
  "ERC20Deposit",
  "ERC721TokenReceived",
  "ERC721BatchReceived",
  "ERC721UserWithdraw",
  "ERC721CreatorWithdraw",
  "ERC1155TokenReceived",
  "ERC1155BatchReceived",
  "ERC1155CreatorWithdraw",
  "ERC1155CreatorWithdrawAll",
  "ERC1155UserWithdrawAll",
]);

export const progressionEventNameShape = z.enum([
  "ObjectiveCompleted",
  "PointsUpdate",
]);

export const rewardEventNameShape = z.enum([
  "ERC20Rewarded",
  "ERC721Rewarded",
  "ERC1155Rewarded",
]);

export type ProgressionEventName = z.infer<typeof progressionEventNameShape>;
export type RewardEventName = z.infer<typeof rewardEventNameShape>;

export const receivedEventBase = z.object({
  loyaltyAddress: z.string().refine(isAddress, "Invalid loyalty address"),
  transactionHash: z.string().length(66),
  userAddress: z.string().refine(isAddress, "Invalid user address"),
  timestamp: z.number().gt(1000000000),
});

export const progressionEventSchema = z
  .object({
    eventName: progressionEventNameShape,
    pointsChange: z.number().optional(),
    objectiveIndex: z.number().optional(),
    userPointsTotal: z.number(),
    ...receivedEventBase.shape,
  })
  .superRefine((data, ctx) => {
    if (
      (data.pointsChange && data.objectiveIndex) ||
      (!data.pointsChange && !data.objectiveIndex)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["pointsChange", "objectiveIndex"],
        message: "Must pass one but only one of pointsChange or objectiveIndex",
      });
    }
  });

export const rewardEventSchema = z
  .object({
    eventName: z.enum(["ERC20Rewarded", "ERC721Rewarded", "ERC1155Rewarded"]),
    escrowType: z.enum(["ERC20", "ERC721", "ERC1155"]),
    tokenId: z.number().optional(),
    tokenAmount: z.number().optional(),
    erc20Amount: z.bigint().optional(),
    ...receivedEventBase.shape,
  })
  .superRefine((data, ctx) => {
    if (
      (data.tokenAmount && data.erc20Amount) ||
      (!data.tokenAmount && !data.erc20Amount)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["tokenAmount", "erc20Amount"],
        message: "Must pass one but only one of tokenAmount or erc20amount",
      });
    }
  });

const erc1155BatchEventShape = z
  .object({
    amounts: z.array(z.number()),
    tokenIds: z.array(z.number()),
  })
  .refine((batch) => batch.amounts.length === batch.tokenIds.length, {
    message: "Token ids and amounts must be the same length",
  });

export const baseWalletEscrowEventSchema = z.object({
  eventName: walletEventNameShape,
  erc20Amount: z.bigint().optional(),
  tokenId: z.number().optional(),
  tokenAmount: z.number().optional(),
  erc721Batch: z.array(z.number()).optional(),
  erc1155Batch: erc1155BatchEventShape.optional(),
  ...receivedEventBase.shape,
});

export const requiredWalletEscrowEventFields: Record<
  string,
  (keyof typeof baseWalletEscrowEventSchema.shape)[]
> = {
  ERC20UserWithdraw: ["erc20Amount"],
  ERC20CreatorWithdraw: ["erc20Amount"],
  ERC20Deposit: ["erc20Amount"],
  ERC721TokenReceived: ["tokenId"],
  ERC721BatchReceived: ["erc721Batch"],
  ERC721UserWithdraw: ["tokenId"],
  ERC721CreatorWithdraw: ["tokenId"],
  ERC1155TokenReceived: ["tokenId", "tokenAmount"],
  ERC1155BatchReceived: ["erc1155Batch"],
  ERC1155CreatorWithdrawAll: ["erc1155Batch"],
  ERC1155UserWithdrawAll: ["erc1155Batch"],
};

export const walletEscrowEventSchema = baseWalletEscrowEventSchema.superRefine(
  (data, ctx) => {
    const requiredFields = requiredWalletEscrowEventFields[data.eventName];
    if (requiredFields) {
      requiredFields.forEach((field) => {
        if (!data[field]) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: `Missing required field ${field} for ${data.eventName} event`,
          });
        }
      });
    }
  },
);

export const eventsRouter = createTRPCRouter({
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
  getWalletEventsByTransactor: protectedProcedure
    .input(
      z.object({ transactorAddress: z.string(), loyaltyAddress: z.string() }),
    )
    .query(async ({ ctx, input }) => {
      const { transactorAddress, loyaltyAddress } = input;
      const walletEvents = await ctx.db.walletEscrowEvent.findMany({
        where: { transactorAddress, loyaltyAddress },
      });
      return walletEvents;
    }),
  getAllProgramUserWithdraws: protectedProcedure
    .input(
      z.object({
        transactorAddress: z.string(),
        loyaltyAddress: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { transactorAddress, loyaltyAddress } = input;
      const withdraws = await ctx.db.walletEscrowEvent.findMany({
        where: { transactorAddress, loyaltyAddress },
      });
      return withdraws;
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
