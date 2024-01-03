import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  test: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return input.message;
    }),
});
