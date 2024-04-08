import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createWalletSet } from "~/utils/transactionRelayUtils";
import { circleChains, initiateCircleSdk } from "~/configs/circle";

export const walletRouter = createTRPCRouter({
  getProgramWalletSetId: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { walletSetId: true },
      });
      if (!program) throw new TRPCError({ code: "NOT_FOUND" });

      return program.walletSetId;
    }),
  getWalletsByLoyaltyAddress: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { wallets: true },
      });
      if (!program) throw new TRPCError({ code: "NOT_FOUND" });

      return program.wallets;
    }),
  getWalletsByWalletSetId: protectedProcedure
    .input(z.object({ walletSetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const wallets = await ctx.db.wallet.findMany({
        where: { walletSetId: input.walletSetId },
      });
      return wallets;
    }),
  getWalletAddressesByWalletSetId: protectedProcedure
    .input(z.object({ walletSetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const walletAddresses = await ctx.db.wallet.findMany({
        where: { walletSetId: input.walletSetId },
        select: { address: true },
      });
      return walletAddresses;
    }),
  getWalletByExternalId: protectedProcedure
    .input(z.object({ externalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const wallets = await ctx.db.wallet.findUnique({
        where: { externalId: input.externalId },
      });
      return wallets;
    }),
  getWalletsCount: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { walletSetId: true },
      });

      if (!program) throw new TRPCError({ code: "NOT_FOUND" });
      if (!program.walletSetId) return null;

      const walletsCount = await ctx.db.wallet.count({
        where: { walletSetId: program.walletSetId },
      });
      const assignedCount = await ctx.db.wallet.count({
        where: { walletSetId: program.walletSetId, isAssigned: true },
      });
      return { totalCount: walletsCount, assignedCount };
    }),
  createWalletSet: protectedProcedure
    .input(z.object({ loyaltyAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const loyaltyAddress = input.loyaltyAddress;

      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: loyaltyAddress },
        select: { walletSetId: true, chainId: true },
      });

      if (!program) throw new TRPCError({ code: "NOT_FOUND" });
      if (program.walletSetId) return null;

      const circleDeveloperSdk = initiateCircleSdk();

      const firstTwo = loyaltyAddress.slice(2, 4);
      const lastFour = loyaltyAddress.slice(-4);
      const walletSetName = "Set" + firstTwo + lastFour + program.chainId;

      const response = await circleDeveloperSdk.createWalletSet({
        name: walletSetName,
      });

      if (!response) return undefined;

      if (
        response.data &&
        response.data.walletSet &&
        response.data.walletSet.id
      ) {
        const update = await ctx.db.loyaltyProgram.update({
          where: { address: loyaltyAddress },
          data: { walletSetId: response.data.walletSet.id },
        });

        return update.walletSetId;
      }
    }),
  createWallet: protectedProcedure
    .input(
      z.object({
        loyaltyAddress: z.string(),
        userId: z.string().uuid(),
        accountType: z.enum(["EOA", "SCA"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.loyaltyProgram.findUnique({
        where: { address: input.loyaltyAddress },
        select: { walletSetId: true, chainId: true },
      });

      if (!program || !program.walletSetId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [circleChain] = circleChains.filter(
        (chain) => chain.chainId === program.chainId,
      );

      if (!circleChain) return null;
      const circleDeveloperSdk = initiateCircleSdk();
      const response = await circleDeveloperSdk.createWallets({
        accountType: input.accountType,
        blockchains: [circleChain.chainName],
        count: 1,
        walletSetId: program.walletSetId,
      });

      if (!response.data) return null;

      if (
        response &&
        response.data &&
        response.data.wallets &&
        response.data.wallets[0]?.id
      ) {
        const newWallet = response.data.wallets[0];
        const update = await ctx.db.wallet.create({
          data: {
            externalId: input.userId,
            address: newWallet.address,
            isAssigned: false,
            walletSetId:
              response.data.wallets[0].walletSetId ?? program.walletSetId,
            walletId: response.data.wallets[0].id,
          },
        });

        return { newWalletAddress: newWallet.address };
      }
    }),
  assignWallet: protectedProcedure
    .input(z.object({ externalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const wallet = await ctx.db.wallet.findUnique({
        where: { externalId: input.externalId },
        select: { refId: true, walletId: true },
      });

      if (!wallet || !wallet.walletId || !wallet.refId) return null;

      const circleDeveloperSdk = initiateCircleSdk();
      const response = await circleDeveloperSdk.updateWallet({
        id: wallet.walletId,
        refId: wallet.refId,
        name: `${wallet.refId} Wallet`,
      });

      if (!response.data || !response.data.wallet) return null;

      if (response.data.wallet.refId === wallet.refId) {
        const update = await ctx.db.wallet.update({
          where: { refId: wallet.refId },
          data: { isAssigned: true },
        });

        return { refId: update.refId, isAssigned: update.isAssigned };
      }
    }),
});
