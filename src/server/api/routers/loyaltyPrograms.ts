import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { rewardTypeNumToPrismaEnum } from "~/utils/rewardTypeNumToPrismaEnum";
import { RewardType } from "@prisma/client";

const objectivesInputSchema = z.array(
  z.object({
    title: z.string(),
    reward: z.number(),
    authority: z.enum(["USER", "CREATOR"]),
  }),
);

const tiersInputSchema = z.array(
  z.object({
    name: z.string(),
    rewardsRequired: z.number(),
  }),
);

const programState = z.enum([
  "Idle",
  "AwaitingEscrowSetup",
  "Active",
  "Completed",
  "Canceled",
]);

const createLoyaltyInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  state: programState,
  address: z.string(),
  creatorId: z.string(),
  objectives: objectivesInputSchema,
  tiers: tiersInputSchema.optional(),
  chain: z.string(),
  chainId: z.number(),
  programStart: z.date(),
  programEnd: z.date(),
  rewardType: z.number(),
});

export const loyaltyProgramsRouter = createTRPCRouter({
  createLoyaltyProgramWithObjectives: protectedProcedure
    .input(createLoyaltyInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.creatorId },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const formattedRewardType = rewardTypeNumToPrismaEnum(input.rewardType);

      const loyaltyProgram = await ctx.db.loyaltyProgram.create({
        data: {
          name: input.name,
          description: input.description ?? undefined,
          state: input.state,
          address: input.address,
          creatorId: input.creatorId,
          chain: input.chain,
          chainId: input.chainId,
          programStart: input.programStart,
          programEnd: input.programEnd,
          rewardType: formattedRewardType,
          tiersActive: input.tiers && input.tiers.length > 0 ? true : false,
        },
      });

      const objectivesWithLoyaltyId = input.objectives.map((obj, index) => ({
        ...obj,
        loyaltyProgramId: loyaltyProgram.id,
        indexInContract: index,
      }));

      await ctx.db.objective.createMany({
        data: objectivesWithLoyaltyId,
      });

      if (input.tiers && input.tiers.length > 0) {
        const tiersWithLoyaltyId = input.tiers.map((tier, index) => ({
          ...tier,
          loyaltyProgramId: loyaltyProgram.id,
          indexInContract: index,
        }));
        await ctx.db.tier.createMany({ data: tiersWithLoyaltyId });
      }

      return { loyaltyProgram };
    }),
  getAllProgramsBasicInfo: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const programs = await ctx.db.loyaltyProgram.findMany({
        where: { creatorId: input.creatorId },
        select: {
          id: true,
          address: true,
          chain: true,
          chainId: true,
          name: true,
          state: true,
          rewardType: true,
          updatedAt: true,
        },
      });

      if (programs.length > 0) return programs;
      else return null;
    }),
  getAllLoyaltyProgramData: protectedProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const { contractAddress } = input;

      const loyaltyProgram = await ctx.db.loyaltyProgram.findUnique({
        where: { address: contractAddress },
      });
      const objectives = await ctx.db.objective.findMany({
        where: { loyaltyProgramId: loyaltyProgram?.id },
      });
      const tiers = await ctx.db.tier.findMany({
        where: { loyaltyProgramId: loyaltyProgram?.id },
      });

      return { loyaltyProgram, objectives, tiers };
    }),
  getBasicLoyaltyDataByAddress: protectedProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const { contractAddress } = input;

      const loyaltyProgram = await ctx.db.loyaltyProgram.findUnique({
        where: { address: contractAddress },
        select: { name: true, rewardType: true, state: true },
      });
      return loyaltyProgram;
    }),
  getRelatedEscrowContractByAddress: protectedProcedure
    .input(z.object({ loyaltyProgramAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const loyaltyProgram = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyProgramAddress },
        select: { escrow: true, rewardType: true },
      });
      if (!loyaltyProgram) return null;
      if (loyaltyProgram.rewardType === RewardType.Points) return null;
      else return loyaltyProgram.escrow;
    }),
});
