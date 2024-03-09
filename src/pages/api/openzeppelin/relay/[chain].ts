import { NextApiRequest, NextApiResponse } from "next";
import { Defender } from "@openzeppelin/defender-sdk";
import LoyaltyObjectivesAbi from "../../../../contractsAndAbis/0.02/LoyaltyProgram/LoyaltyObjectivesAbi.json";
import { Contract } from "ethers";
import { type TransactionReceipt } from "ethers";
import { db } from "~/server/db";
import { MAX_OBJECTIVES_LENGTH } from "~/constants/loyaltyConstants";
import { relayChains } from "~/configs/openzeppelin";

//TODO 3-7: this is strictly for experimentation right now

const verifyLoyaltyAddressChain = async (
  loyaltyAddress: string,
  chainName: string,
): Promise<number> => {
  const [relayChain] = relayChains.filter((chain) => chain.name === chainName);
  if (!relayChain) return 0;

  const loyaltyProgram = await db.loyaltyProgram.findUnique({
    where: { address: loyaltyAddress },
    select: { chainId: true },
  });
  if (!loyaltyProgram || !loyaltyProgram.chainId) return 0;
  else return loyaltyProgram.chainId;
};

const verifyCreatorAndApiKey = async (
  creatorAddress: string,
  apiKey: string,
): Promise<boolean> => {
  //TODO - update this with api key when database is updated.

  /* const creator = await db.user.findUnique({
    where: {address: creatorAddress}, 
    select: {apiKey: true}
  })

  if (!creator || !creator.apiKey) return false; 
  if (apiKey !== creator.apiKey) return false; 

  */
  return true;
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

  try {
    const {
      objectiveIndex,
      userAddress,
      loyaltyAddress,
      creatorAddress,
      apiKey,
    } = req.body;
    const { chain: chainName } = req.query;

    const validObjectiveIndex = objectiveIndex < MAX_OBJECTIVES_LENGTH;
    const verifiedChain = await verifyLoyaltyAddressChain(
      loyaltyAddress,
      String(chainName),
    );
    const verifiedCreator = await verifyCreatorAndApiKey(
      creatorAddress,
      apiKey,
    );

    if (!validObjectiveIndex) {
      res.statusMessage = "Invalid objective index";
      return res.status(400).json({ error: "Invalid objective index" });
    }

    if (verifiedChain === 0) {
      res.statusMessage = "Not a supported blockchain";
      return res.status(400).json({ error: "Not a supported blockchain" });
    }

    if (!verifiedCreator) {
      res.statusMessage = "Failed to verify creator address and api key";
      return res
        .status(401)
        .json({ error: "Could not verify api key and creator" });
    }

    const receipt = await relayerCompleteObjective(
      objectiveIndex,
      userAddress,
      loyaltyAddress,
      verifiedChain,
    );

    if (!receipt) {
      res.statusMessage = "Transaction failed or reverted";
      return res.status(500).json({ error: "Transaction failed or reverted" });
    }

    return res.status(200).json(receipt);
  } catch (error) {
    console.error("error from serv -->", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
