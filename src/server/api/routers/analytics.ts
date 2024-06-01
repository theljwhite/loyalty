import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
        },
      });

      if (!averages) throw new TRPCError({ code: "NOT_FOUND" });
      return averages;
    }),
  getRetentionRate: protectedProcedure
    .input(z.object({ userAddress: z.string(), loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const analytics = await ctx.db.programAnalyticsSummary.findUnique({
        where: { loyaltyAddress: input.loyaltyAddress },
        select: { totalUniqueUsers: true, returningUsers: true },
      });

      if (!analytics) return null;

      const retentionRate =
        (analytics.returningUsers / analytics.totalUniqueUsers) * 100;

      return retentionRate;
    }),
  updateTotalsFromEvents: protectedProcedure
    .input(
      z.object({
        eventName: z.enum(["ObjectiveCompleted", "PointsUpdate"]),
        userAddress: z.string(),
        loyaltyAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventName, userAddress, loyaltyAddress } = input;

      const isObjectiveEvent = eventName === "ObjectiveCompleted";

      await ctx.db.$transaction(async (tx) => {
        const userProgEventsCount = await tx.progressionEvent.count({
          where: { loyaltyAddress, userAddress },
        });

        let returningUsersIncrement = 0;
        let totalUniqueUsersIncrement = 0;

        if (userProgEventsCount === 0) totalUniqueUsersIncrement = 1;
        if (userProgEventsCount === 1) returningUsersIncrement = 1;

        await tx.programAnalyticsSummary.update({
          where: { loyaltyAddress },
          data: {
            totalUniqueUsers: { increment: totalUniqueUsersIncrement },
            returningUsers: { increment: returningUsersIncrement },
            totalObjectivesCompleted: { increment: isObjectiveEvent ? 1 : 0 },
          },
        });
      });
    }),
  getMonthlyAndDailyUsers: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      //this is possibly temporary
      const now = new Date();

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      startOfMonth.setDate(startOfMonth.getDate() - 30);

      const dailyUsers = await ctx.db.progressionEvent.groupBy({
        by: "userAddress",
        where: {
          loyaltyAddress: input.loyaltyAddress,
          timestamp: { gte: startOfToday },
        },
        _count: {
          userAddress: true,
        },
      });

      const monthlyUsers = await ctx.db.progressionEvent.groupBy({
        by: "userAddress",
        where: {
          loyaltyAddress: input.loyaltyAddress,
          timestamp: { gte: startOfMonth },
        },
        _count: { userAddress: true },
      });

      return { dailyUsers, monthlyUsers };
    }),
});
