import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { rewardTypeNumToPrismaEnum } from "~/utils/rewardTypeNumToPrismaEnum";

const objectivesInputSchema = z.array(
  z.object({
    indexInContract: z.number(),
    title: z.string(),
    reward: z.number(),
    authority: z.enum(["USER", "CREATOR"]),
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
  state: programState,
  address: z.string(),
  creatorId: z.string(),
  objectives: objectivesInputSchema,
  chain: z.string(),
  chainId: z.number(),
  programStart: z.date(),
  programEnd: z.date(),
  rewardType: z.number(),
});

export const loyaltyProgramsRouter = createTRPCRouter({
  createLoyaltyProgramWithObjectives: protectedProcedure
    .input(createLoyaltyInputSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        state,
        address,
        creatorId,
        objectives,
        chain,
        chainId,
        programStart,
        programEnd,
        rewardType,
      } = input;

      const user = await ctx.db.user.findUnique({ where: { id: creatorId } });
      if (!user || user.role != "Creator") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const formattedRewardType = rewardTypeNumToPrismaEnum(rewardType);

      const loyaltyProgram = await ctx.db.loyaltyProgram.create({
        data: {
          name,
          state,
          address,
          creatorId,
          chain,
          chainId,
          programStart,
          programEnd,
          rewardType: formattedRewardType,
        },
      });

      const objectivesWithLoyaltyId = objectives.map((obj) => ({
        ...obj,
        loyaltyProgramId: loyaltyProgram.id,
      }));

      console.log("objectives with loyalty id", objectivesWithLoyaltyId);

      const createdObjectives = await ctx.db.objective.createMany({
        data: objectivesWithLoyaltyId,
      });

      return { loyaltyProgram, createdObjectives };
    }),
});
