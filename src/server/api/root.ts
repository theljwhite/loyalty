import { createTRPCRouter } from "~/server/api/trpc";
import { loyaltyProgramsRouter } from "~/server/api/routers/loyaltyPrograms";
import { escrowRouter } from "./routers/escrow";
import { userRouter } from "~/server/api/routers/user";
import { walletRouter } from "./routers/wallet";
import { analyticsRouter } from "./routers/analytics";

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
  analytics: analyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
