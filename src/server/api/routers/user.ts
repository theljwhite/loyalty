import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
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
});
