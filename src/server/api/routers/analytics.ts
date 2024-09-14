import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { progressionEventNameShape, rewardEventNameShape } from "./events";
import {
  countProgEventsInDateRange,
  countObjCompletionsInDateRange,
  getERC20EventsForChart,
  getERC721EventsForChart,
  getERC1155EventsForTokenChart,
  countUniqueUserERC20EventsInDateRange,
} from "~/utils/programAnalytics";

export const rewardEventUpdateInputSchema = z.object({
  eventName: rewardEventNameShape,
  userAddress: z.string(),
  loyaltyAddress: z.string(),
  chainId: z.number(),
  timestamp: z.number().gt(1000000000),
  topics: z.object({
    erc20Amount: z.bigint().optional(),
    tokenId: z.number().optional(),
    tokenAmount: z.number().optional(),
  }),
});

export const progressionEventUpdateInputSchema = z.object({
  eventName: progressionEventNameShape,
  userAddress: z.string(),
  loyaltyAddress: z.string(),
  timestamp: z.number().gt(1000000000),
});

export const analyticsRouter = createTRPCRouter({
  initAnalyticsSummaryAndEvents: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx) => {
        await tx.loyaltyProgram.update({
          where: { address: input.loyaltyAddress },
          data: { contractEvents: true },
        });

        await tx.programAnalyticsSummary.create({
          data: { loyaltyAddress: input.loyaltyAddress },
        });
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
  getAllCreatorProgramsBasicStats: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const programStats = await ctx.db.loyaltyProgram.findMany({
        where: { creatorId: input.creatorId },
        select: {
          address: true,
          name: true,
          analyticsSummary: {
            select: {
              totalUniqueUsers: true,
              totalUniqueRewarded: true,
              monthlyAverageUsers: true,
            },
          },
        },
      });
      return programStats;
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
  //TODO: getSummaryAndCharts will be updated to only get relevant reward events, based on the program.rewardType
  getSummaryAndCharts: protectedProcedure
    .input(
      z.object({
        loyaltyAddress: z.string(),
        startDate: z.date().nullable(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { rewardType: true },
      });

      if (!program) throw new TRPCError({ code: "NOT_FOUND" });

      const [
        summary,
        progressionEventCounts,
        objEventCounts,
        userERC20Rewards,
        userERC721Rewards,
        erc1155RewardEventCounts,
        uniqueERC20UserRewards,
      ] = await Promise.all([
        ctx.db.programAnalyticsSummary.findUnique({
          where: { loyaltyAddress: input.loyaltyAddress },
        }),
        countProgEventsInDateRange(ctx, input),
        countObjCompletionsInDateRange(ctx, input),
        getERC20EventsForChart(ctx, input),
        getERC721EventsForChart(ctx, input),
        getERC1155EventsForTokenChart(ctx, input),
        countUniqueUserERC20EventsInDateRange(ctx, input),
      ]);

      if (!summary) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        program,
        summary,
        progressionEventCounts,
        objEventCounts,
        userERC20Rewards,
        userERC721Rewards,
        erc1155RewardEventCounts,
        uniqueERC20UserRewards,
      };
    }),
});
