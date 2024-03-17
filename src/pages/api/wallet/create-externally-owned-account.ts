import { NextApiRequest, NextApiResponse } from "next";
import { initiateCircleSdk } from "~/configs/circle";
import { db } from "~/server/db";
import { circleChains } from "~/configs/circle";
import { parseUUID } from "~/utils/parseUUID";

//TODO: protect route

const getWalletSetIdForProgram = async (
  loyaltyAddress: string,
): Promise<{ walletSetId: string; chainId: number } | undefined> => {
  const program = await db.loyaltyProgram.findUnique({
    where: { address: loyaltyAddress },
    select: { walletSetId: true, chainId: true },
  });

  if (!program || !program.walletSetId) return undefined;
  return { walletSetId: program.walletSetId, chainId: program.chainId };
};

const updateDbWallet = async (
  walletSetId: string,
  externalUserId: string,
  walletAddress: string,
  walletId: string,
): Promise<boolean> => {
  if (!walletId || !walletAddress) return false;
  try {
    const update = await db.wallet.create({
      data: {
        externalId: externalUserId ?? "",
        address: walletAddress,
        isAssigned: false,
        walletSetId,
        walletId,
      },
    });
    if (update.walletSetId === walletSetId) return true;
    return false;
  } catch (error) {
    return false;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { loyaltyAddress, userUniqueId } = req.body;

  const isUUID = parseUUID(userUniqueId);

  if (!isUUID) {
    return res.status(500).json({ error: "Failed to validate id as UUID" });
  }

  try {
    const program = await getWalletSetIdForProgram(loyaltyAddress);

    if (!program) {
      return res
        .status(500)
        .json({ error: "Could not verify loyalty program" });
    }

    if (!program.walletSetId) {
      return res.status(500).json({ error: "Missing wallet set id" });
    }

    const circleDeveloperSdk = initiateCircleSdk();

    const [circleChain] = circleChains.filter(
      (chain) => chain.chainId === program.chainId,
    );

    if (!circleChain) {
      return res.status(500).json({ error: "Invalid chain id" });
    }

    const response = await circleDeveloperSdk.createWallets({
      accountType: "EOA",
      blockchains: [circleChain.chainName],
      count: 1,
      walletSetId: program.walletSetId,
    });

    if (!response.data) {
      return res
        .status(500)
        .json({ error: "Failed response from external provider" });
    }

    if (response && response.data && response.data.wallets) {
      const newWalletAddress = response.data.wallets[0];

      const didDbUpdate = await updateDbWallet(
        program.walletSetId,
        userUniqueId,
        response.data.wallets[0]?.address ?? "",
        response.data.wallets[0]?.id ?? "",
      );

      if (!didDbUpdate) {
        return res.status(500).json({ error: "Failed to update wallets db" });
      }

      return res.status(200).json({ walletAddress: newWalletAddress });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate EOA" });
  }
}
