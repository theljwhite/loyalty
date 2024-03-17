import { NextApiRequest, NextApiResponse } from "next";
import { Defender } from "@openzeppelin/defender-sdk";
import LoyaltyObjectivesAbi from "../../../../contractsAndAbis/0.02/LoyaltyProgram/LoyaltyObjectivesAbi.json";
import { Contract } from "ethers";
import { type TransactionReceipt } from "ethers";
import { db } from "~/server/db";
import { MAX_OBJECTIVES_LENGTH } from "~/constants/loyaltyConstants";
import { relayChains } from "~/configs/openzeppelin";
import { parseUUID } from "~/utils/parseUUID";

//TODO 3-17: this is strictly for experimentation right now

const verifyLoyaltyAddressChain = async (
  loyaltyAddress: string,
  chainName: string,
): Promise<{ chain: number; id: string | null }> => {
  const [relayChain] = relayChains.filter((chain) => chain.name === chainName);
  if (!relayChain) return { chain: 0, id: null };

  const loyaltyProgram = await db.loyaltyProgram.findUnique({
    where: { address: loyaltyAddress },
    select: { chainId: true, id: true },
  });
  if (!loyaltyProgram || !loyaltyProgram.chainId) return { chain: 0, id: null };
  else return { chain: loyaltyProgram.chainId, id: loyaltyProgram.id };
};

const generateEOA = async (
  loyaltyAddress: string,
  userUniqueId: string,
): Promise<string | undefined> => {
  try {
    const response = await fetch(
      "/api/wallet/create-externally-owned-account",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loyaltyAddress,
          userUniqueId,
        }),
      },
    );

    if (!response) return "";

    const walletAddress = await response.json();
    return walletAddress;
  } catch (error) {
    return "";
  }
};

const createOpenZepRelayerClient = async (chainId: number): Promise<any> => {
  const [relayChain] = relayChains.filter((chain) => chain.id === chainId);
  const client = new Defender({
    relayerApiKey: relayChain?.relayerKey,
    relayerApiSecret: relayChain?.relayerSecret,
  });

  const defenderProvider = client.relaySigner.getProvider();
  const signer = client.relaySigner.getSigner(defenderProvider, {
    speed: "fast",
  });

  return { signer, provider: defenderProvider };
};

const relayerCompleteObjective = async (
  objectiveIndex: number,
  userAddress: string,
  loyaltyAddress: string,
  chainId: number,
): Promise<TransactionReceipt | null> => {
  try {
    const { signer, provider } = await createOpenZepRelayerClient(chainId);

    const loyaltyProgramContract = new Contract(
      loyaltyAddress,
      LoyaltyObjectivesAbi,
      signer,
    );

    const transaction =
      await loyaltyProgramContract.completeCreatorAuthorityObjective?.(
        objectiveIndex,
        userAddress,
        { gasLimit: 900000 },
      );
    const txDetails = await transaction.getTransaction();
    const receipt = await provider.waitForTransaction(txDetails?.hash, 1);

    console.log("receipt -->", receipt);

    if (receipt.status === 0) return null;

    return receipt;
  } catch (error) {
    console.error("error from relay test -->", error);
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const requestPath = new URL(req.url ?? "", `https://${req.headers.host}`)
    .pathname;

  const creatorApiKey = req.headers["x-loyalty-api-key"] ?? "";
  const entitySecret = req.headers["x-loyalty-entity-secret"] ?? "";
  const version = req.headers["x-loyalty-version"] ?? "";
  const backendAdapter = req.headers["x-loyalty-be-adapter"] ?? "";
  //TODO verify apiKey, entitySecret, version

  if (!creatorApiKey || !entitySecret || !version || !backendAdapter) {
    return res.status(400).json({ error: "Missing required headers" });
  }

  const { userAddress, userId, objectiveIndex, loyaltyContractAddress } =
    req.body;
  const { chain: chainName } = req.query;

  if ((!userAddress && !userId) || (userAddress && userId)) {
    return res.status(400).json({
      error:
        "User must be identified by wallet address or userId. Cannot use both",
    });
  }

  if (!objectiveIndex || !loyaltyContractAddress) {
    return res.status(400).json({ error: "Missing required body paramaters" });
  }

  const validObjectiveIndex = objectiveIndex < MAX_OBJECTIVES_LENGTH;

  if (!validObjectiveIndex) {
    return res.status(400).json({ error: "Invalid objective index" });
  }

  //TODO validateWhitelistedDomain(req.headers.host);

  if (
    backendAdapter !== "next" &&
    backendAdapter !== "server-sdk" &&
    backendAdapter !== "express"
  ) {
    return res.status(400).json({ error: "Invalid backend adapter" });
  }

  if (backendAdapter === "next") {
    const expectedNextRouterPath = "/api/objectives-router";
    if (requestPath !== expectedNextRouterPath) {
      return res.status(400).json({
        error: `Incorrect path. Expected: ${expectedNextRouterPath}, got ${requestPath}`,
      });
    }
  }

  try {
    const verifiedProgram = await verifyLoyaltyAddressChain(
      loyaltyContractAddress,
      String(chainName),
    );

    if (verifiedProgram.chain === 0) {
      return res.status(400).json({ error: "Not a supported blockchain" });
    }

    let completingObjectiveAddress: string = userAddress;

    if (!userAddress && userId) {
      const generatedWalletAddress = await generateEOA(
        loyaltyContractAddress,
        String(userId),
      );

      if (!generatedWalletAddress) {
        return res.status(500).json({ error: "Failed to generate EOA" });
      }
      completingObjectiveAddress = generatedWalletAddress;
    }

    const txReceipt = await relayerCompleteObjective(
      objectiveIndex,
      completingObjectiveAddress,
      loyaltyContractAddress,
      verifiedProgram.chain,
    );

    if (!txReceipt) {
      res.statusMessage = "Transaction failed or reverted";
      return res.status(500).json({ error: "Transaction failed or reverted" });
    }

    return res.status(200).json(txReceipt);
  } catch (error) {
    console.error("error from serv -->", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
