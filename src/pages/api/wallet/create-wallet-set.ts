import { NextApiRequest, NextApiResponse } from "next";
import { circleChains } from "~/configs/circle";
import { db } from "~/server/db";
import { createWalletSet } from "~/utils/transactionRelayUtils";

//TODO protect this. move DB call to TRPC router/caller factory

const checkIfExistingSetForProgram = async (
  loyaltyAddress: string,
): Promise<
  { name: string; walletSetId: string | null; chainId: number } | undefined
> => {
  const program = await db.loyaltyProgram.findUnique({
    where: { address: loyaltyAddress },
    select: { name: true, walletSetId: true, chainId: true },
  });

  if (!program) return undefined;

  return {
    name: program.name,
    walletSetId: program.walletSetId,
    chainId: program.chainId,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { loyaltyAddress } = req.body;

  try {
    const loyaltyProgram = await checkIfExistingSetForProgram(loyaltyAddress);

    if (!loyaltyProgram) {
      return res.status(500).json({ error: "Couldnt verify loyalty program" });
    }

    const validChain = circleChains.some(
      (chain) => chain.chainId === loyaltyProgram.chainId,
    );

    if (!validChain) {
      res.statusMessage = "Not a supported blockchain";
      return res.status(400).json({ error: "Not a supported blockchain" });
    }

    if (!loyaltyProgram) {
      res.statusMessage = "Could not verify loyalty program";
      return res
        .status(500)
        .json({ error: "Could not verify loyalty program" });
    }
    if (loyaltyProgram.walletSetId) {
      return res
        .status(409)
        .json({ error: "Program already has a wallet set" });
    }

    const walletSetId = await createWalletSet(
      String(loyaltyAddress),
      loyaltyProgram.chainId,
    );

    if (!walletSetId) {
      return res
        .status(500)
        .json({ error: "Failed to execute wallet set creation" });
    }

    return res.status(200).json({ walletSetId });
  } catch (error) {
    console.error("error from create wallet set", error);
    return res
      .status(500)
      .json({ error: "Failed to verify or execute wallet set creation" });
  }
}
