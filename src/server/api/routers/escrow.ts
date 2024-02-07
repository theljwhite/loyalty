import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const escrowState = z.enum([
  "Idle",
  "AwaitingEscrowApprovals",
  "DepositPeriod",
  "AwaitingEscrowSettings",
  "InIssuance",
  "Completed",
  "Frozen",
  "Canceled",
]);

const createEscrowInputSchema = z.object({
  address: z.string(),
  creatorId: z.string(),
  escrowType: z.enum(["ERC20", "ERC721", "ERC1155"]),
  state: escrowState,
  loyaltyAddress: z.string(),
});

export const escrowRouter = createTRPCRouter({
  createEscrow: protectedProcedure
    .input(createEscrowInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { address, creatorId, escrowType, state, loyaltyAddress } = input;

      const user = await ctx.db.user.findUnique({ where: { id: creatorId } });
      if (!user || user.role != "Creator") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const escrow = await ctx.db.escrow.create({
        data: {
          address,
          creatorId,
          escrowType,
          state,
          loyaltyAddress,
        },
      });

      await ctx.db.loyaltyProgram.update({
        where: { address: loyaltyAddress },
        data: { escrowAddress: escrow.address },
      });

      return escrow;
    }),
  getEscrowDepositKey: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const { loyaltyAddress } = input;

      const escrow = await ctx.db.escrow.findUnique({
        where: { loyaltyAddress },
        select: { depositKey: true },
      });
      if (!escrow) throw new TRPCError({ code: "NOT_FOUND" });
      return escrow.depositKey;
    }),
  getEscrowApprovalsStatus: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const escrow = await ctx.db.escrow.findUnique({
        where: { loyaltyAddress: input.loyaltyAddress },
        select: {
          isSenderApproved: true,
          isRewardApproved: true,
          isDepositKeySet: true,
        },
      });
      if (!escrow) throw new TRPCError({ code: "NOT_FOUND" });

      const allApprovalsComplete: boolean = Object.values(escrow).every(
        (value) => value,
      );

      return {
        allApprovalsComplete,
        isSenderApproved: escrow.isSenderApproved,
        isRewardApproved: escrow.isRewardApproved,
        isDepositKeySet: escrow.isDepositKeySet,
      };
    }),
  getEscrowState: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const escrow = await ctx.db.escrow.findUnique({
        where: { loyaltyAddress: input.loyaltyAddress },
        select: { state: true },
      });
      if (!escrow) throw new TRPCError({ code: "NOT_FOUND" });
      return escrow.state;
    }),
  updateEscrowState: protectedProcedure
    .input(z.object({ escrowAddress: z.string(), newEscrowState: escrowState }))
    .mutation(async ({ ctx, input }) => {
      const { escrowAddress, newEscrowState } = input;
      const updatedEscrowState = await ctx.db.escrow.update({
        where: { address: escrowAddress },
        data: { state: newEscrowState },
      });
      return updatedEscrowState.state;
    }),
  getDepositRelatedData: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const escrow = await ctx.db.escrow.findUnique({
        where: { loyaltyAddress: input.loyaltyAddress },
        select: {
          state: true,
          escrowType: true,
          depositEndDate: true,
          address: true,
          depositKey: true,
          rewardAddress: true,
        },
      });
      const loyaltyProgram = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { chain: true, chainId: true, programEnd: true },
      });

      return { escrow, loyaltyProgram };
    }),
  doApprovalsUpdate: protectedProcedure
    .input(
      z.object({
        escrowAddress: z.string(),
        rewardAddress: z.string().optional(),
        senderAddress: z.string().optional(),
        isSenderApproved: z.boolean().optional(),
        isRewardApproved: z.boolean().optional(),
        isDepositKeySet: z.boolean().optional(),
        depositEndDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        escrowAddress,
        rewardAddress,
        senderAddress,
        isSenderApproved,
        isRewardApproved,
        isDepositKeySet,
        depositEndDate,
      } = input;

      const existingApprovals = await ctx.db.escrow.findUnique({
        where: { address: escrowAddress },
        select: {
          isRewardApproved: true,
          isSenderApproved: true,
          isDepositKeySet: true,
        },
      });

      const allApprovalsComplete = Object.values(existingApprovals ?? {}).every(
        (value) => value,
      );

      const updatedEscrow = await ctx.db.escrow.update({
        where: { address: escrowAddress },
        data: {
          rewardAddress,
          senderAddress,
          isSenderApproved,
          isRewardApproved,
          isDepositKeySet,
          depositEndDate,
          state: allApprovalsComplete ? "DepositPeriod" : undefined,
        },
      });

      return updatedEscrow;
    }),
});
