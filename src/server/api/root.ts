import { createTRPCRouter } from "~/server/api/trpc";
import { loyaltyProgramsRouter } from "~/server/api/routers/loyaltyPrograms";
import { escrowRouter } from "~/server/api/routers/escrow";
import { userRouter } from "~/server/api/routers/user";
import { walletRouter } from "~/server/api/routers/wallet";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { eventsRouter } from "~/server/api/routers/events";

/**
 * This is the primary router for the server.
 *
 *
 */
export const appRouter = createTRPCRouter({
  loyaltyPrograms: loyaltyProgramsRouter,
  users: userRouter,
  escrow: escrowRouter,
  wallet: walletRouter,
  events: eventsRouter,
  analytics: analyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
