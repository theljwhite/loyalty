import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
});
