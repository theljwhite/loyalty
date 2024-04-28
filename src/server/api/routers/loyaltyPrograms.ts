import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { rewardTypeNumToPrismaEnum } from "~/utils/rewardTypeNumToPrismaEnum";
import { EscrowState, ProgramState, RewardType } from "@prisma/client";
import { getAfterDeploymentStepsNeeded } from "~/utils/afterDeploymentSteps";
import { escrowState } from "./escrow";

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
  version: z.string().optional(),
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
          version: input.version ?? process.env.LATEST_PROGRAM_VERSION,
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
        select: {
          name: true,
          rewardType: true,
          state: true,
          escrowAddress: true,
          escrow: true,
          chainId: true,
        },
      });

      const nextStepsNeeded = getAfterDeploymentStepsNeeded(
        loyaltyProgram?.rewardType ?? "Points",
        loyaltyProgram?.state ?? "Idle",
        loyaltyProgram?.escrow?.state,
        loyaltyProgram?.escrowAddress ?? "",
      );

      return {
        name: loyaltyProgram?.name,
        escrowAddress: loyaltyProgram?.escrowAddress,
        rewardType: loyaltyProgram?.rewardType,
        state: loyaltyProgram?.state,
        escrowState: loyaltyProgram?.escrow?.state,
        chainId: loyaltyProgram?.chainId,
        stepsNeeded: nextStepsNeeded,
      };
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
  getOnlyEscrowAddressByLoyaltyAddress: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { escrowAddress: true },
      });
      if (!program) throw new TRPCError({ code: "NOT_FOUND" });
      return program.escrowAddress;
    }),
  getDeploymentInfoByAddress: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const deployInfo = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { createdAt: true, chain: true, chainId: true },
      });
      return deployInfo;
    }),
  getEscrowApprovalsRelatedData: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const details = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { escrow: true, creator: true, programEnd: true },
      });

      if (!details || !details.escrow) {
        throw new TRPCError({ code: "NOT_FOUND" });
      } else
        return {
          escrowAddress: details.escrow.address,
          escrowType: details.escrow.escrowType,
          creatorAddress: details.creator.address,
          depositKey: details.escrow.depositKey,
          isRewardApproved: details.escrow.isRewardApproved,
          isSenderApproved: details.escrow.isSenderApproved,
          programEnd: details.programEnd,
        };
    }),
  getOnlyObjectivesAndTiers: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { objectives: true, tiers: true },
      });
      if (!program) throw new TRPCError({ code: "NOT_FOUND" });
      return { objectives: program.objectives, tiers: program.tiers };
    }),
  getChainOnly: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { chain: true, chainId: true },
      });

      if (!program) throw new TRPCError({ code: "NOT_FOUND" });

      return { chain: program.chain, chainId: program.chainId };
    }),
  getContractEventsStatus: protectedProcedure
    .input(
      z.object({
        loyaltyAddress: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { contractEvents: true },
      });
      if (!program) throw new TRPCError({ code: "NOT_FOUND" });
      return program.contractEvents;
    }),
  updateProgramStateOrEscrowState: protectedProcedure
    .input(
      z.object({
        loyaltyAddress: z.string(),
        newProgramState: programState.optional(),
        newEscrowState: escrowState.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { loyaltyAddress, newProgramState, newEscrowState } = input;

      const stateUpdates: {
        state: ProgramState | null;
        escrowState: EscrowState | null;
      } = { state: null, escrowState: null };

      if (newProgramState) {
        const update = await ctx.db.loyaltyProgram.update({
          where: { address: loyaltyAddress },
          data: {
            state: newProgramState,
          },
        });
        stateUpdates.state = update.state;
      }

      if (newEscrowState) {
        const updateEscrow = await ctx.db.escrow.update({
          where: { loyaltyAddress },
          data: {
            state: newEscrowState,
          },
        });
        stateUpdates.escrowState = updateEscrow.state;
      }
      return stateUpdates;
    }),
  updateContractEventListening: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string(), isEnabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.update({
        where: { address: input.loyaltyAddress },
        data: { contractEvents: input.isEnabled },
      });
      return program.contractEvents;
    }),
});
