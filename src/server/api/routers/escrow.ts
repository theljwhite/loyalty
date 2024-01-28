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
});
