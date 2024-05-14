import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  updateBasicCreatorProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().max(32).optional(),
        email: z.string().email(),
        creatorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, creatorId } = input;
      const update = await ctx.db.user.update({
        where: { id: creatorId },
        data: { name, email },
      });

      if (!update) return null;
      return { name: update.name, email: update.email };
    }),

  giveCreatorRole: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userUpdate = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: "Creator" },
      });
      return userUpdate.role;
    }),
  getApiKeyCreationDate: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.creatorId },
        select: { apiKeyUpdatedAt: true },
      });

      if (!user || !user.apiKeyUpdatedAt) return null;
      else return user.apiKeyUpdatedAt;
    }),
  getEntitySecretUpdatedDate: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.creatorId },
        select: { esUpdatedAt: true },
      });

      if (!user || !user.esUpdatedAt) return null;
      return user.esUpdatedAt;
    }),
  getCreatorLinkedAccountProviders: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.creatorId },
        select: { accounts: true },
      });

      if (!user || !user.accounts) return null;

      const providerNames = user.accounts.map((account) => account.provider);

      return providerNames;
    }),
});
