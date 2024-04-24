import { NextApiRequest, NextApiResponse } from "next";
import { initiateCircleSdk } from "~/configs/circle";
import { circleChains } from "~/configs/circle";
import {
  getWalletSetIdForProgram,
  createDbWallet,
} from "~/utils/transactionRelayUtils";

//TODO: protect route
//  - validate with zod

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { loyaltyAddress, userUniqueId } = req.body;

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

      const didDbUpdate = await createDbWallet(
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
