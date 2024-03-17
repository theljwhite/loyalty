import { NextApiRequest, NextApiResponse } from "next";
import { circleChains, initiateCircleSdk } from "~/configs/circle";
import { db } from "~/server/db";

const checkIfExistingSetForProgram = async (
  loyaltyAddress: string,
): Promise<{ name: string; walletSetId: string | null } | undefined> => {
  const program = await db.loyaltyProgram.findUnique({
    where: { address: loyaltyAddress },
    select: { name: true, walletSetId: true },
  });

  if (!program) return undefined;

  return { name: program.name, walletSetId: program.walletSetId };
};

const updateDbWalletSet = async (
  loyaltyAddress: string,
  walletSetId: string,
): Promise<boolean> => {
  if (!walletSetId) return false;

  try {
    const update = await db.loyaltyProgram.update({
      where: { address: loyaltyAddress },
      data: { walletSetId },
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

  const { loyaltyAddress, chainId } = req.body;

  const validChain = circleChains.some((chain) => chain.chainId === chainId);
  if (!validChain) {
    res.statusMessage = "Not a supported blockchain";
    return res.status(400).json({ error: "Not a supported blockchain" });
  }
  try {
    const loyaltyProgram = await checkIfExistingSetForProgram(loyaltyAddress);

    if (!loyaltyProgram) {
      res.statusMessage = "Could not verify loyalty program";
      return res
        .status(500)
        .json({ error: "Could not verify loyalty program" });
    }
    if (loyaltyProgram.walletSetId) {
      return res
        .status(500)
        .json({ error: "Program already has a wallet set" });
    }

    const circleDeveloperSdk = initiateCircleSdk();
    const newWalletSetName = loyaltyAddress + loyaltyProgram.name;

    const response = await circleDeveloperSdk.createWalletSet({
      name: "test name",
    });

    if (!response.data) {
      res.statusMessage = "Bad response from external provider";
      return res
        .status(500)
        .json({ error: "Bad response from external provider" });
    }

    const didUpdate = await updateDbWalletSet(
      loyaltyAddress,
      response.data.walletSet?.id ?? "",
    );

    if (!didUpdate) {
      return res
        .status(500)
        .json({ error: "Failed to update database with wallet set" });
    }
    return res.status(200).json({ walletSetId: response.data.walletSet });
  } catch (error) {
    console.error("error from create wallet set", error);
    res.statusMessage = "Failed to verify or execute wallet set creation";
    return res
      .status(500)
      .json({ error: "Failed to verify or execute wallet set creation" });
  }
}
