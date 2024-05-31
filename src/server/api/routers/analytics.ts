import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { formatUnits } from "ethers";

export const analyticsRouter = createTRPCRouter({
  initAnalyticsSummary: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
      });

      if (!program) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.programAnalyticsSummary.create({
        data: { loyaltyAddress: input.loyaltyAddress },
      });
    }),

  getSummaryByAddress: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const summary = await ctx.db.programAnalyticsSummary.findUnique({
        where: { loyaltyAddress: input.loyaltyAddress },
      });

      if (!summary) throw new TRPCError({ code: "NOT_FOUND" });

      return summary;
    }),
  getSummaryById: protectedProcedure
    .input(z.object({ summaryId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.programAnalyticsSummary.findUnique({
        where: { id: input.summaryId },
      });
    }),
  getTotals: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const totals = await ctx.db.programAnalyticsSummary.findUnique({
        where: { loyaltyAddress: input.loyaltyAddress },
        select: {
          totalObjectivesCompleted: true,
          totalUniqueUsers: true,
          totalUniqueRewarded: true,
          totalTokensWithdrawn: true,
          totalERC20Withdrawn: true,
          totalUnclaimedTokens: true,
          totalUnclaimedERC20: true,
        },
      });

      if (!totals) throw new TRPCError({ code: "NOT_FOUND" });
      return totals;
    }),
  getAverages: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const averages = await ctx.db.programAnalyticsSummary.findUnique({
        where: { loyaltyAddress: input.loyaltyAddress },
        select: {
          avgUserWithdrawTime: true,
          dailyAverageUsers: true,
          monthlyAverageUsers: true,
          retentionRate: true,
        },
      });

      if (!averages) throw new TRPCError({ code: "NOT_FOUND" });
      return averages;
    }),

  updateRetentionRate: protectedProcedure
    .input(z.object({ userAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingInteraction = await ctx.db.progressionEvent.findFirst({
        where: { userAddress: input.userAddress },
      });

      if (!existingInteraction) return null;
    }),
});
