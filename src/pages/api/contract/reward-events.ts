import { type NextApiRequest, type NextApiResponse } from "next";
import { redisInstance } from "~/utils/apiValidation";
import { id } from "ethers";
import {
  decodeEscrowRewardLogs,
  getEventName,
} from "~/utils/contractEventListener";
import {
  createRewardEvent,
  updateTotalsFromRewardEvents,
} from "~/utils/relayAnalytics";

//TODO - parsing inputs commented out for now

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const signature = req.headers["x-signature"];

    const generatedSignature = id(
      JSON.stringify(req.body) + process.env.MORALIS_STREAM_SECRET,
    );
    if (signature !== generatedSignature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const data = req.body;
    const txHash = data.logs[0].transactionHash;
    const payloadCount: number | null = await redisInstance.get(`RE-${txHash}`);

    if (!data.confirmed && !payloadCount) {
      await redisInstance.set(`RE-${txHash}`, 1);
      return res.status(202).end();
    }

    //handles incorrect order, if confirmed is sent before unconfirmed
    if (data.confirmed && payloadCount !== 1) {
      await redisInstance.set(`RE-${txHash}`, 1);
      return res.status(202).end();
    }

    //as long as a prior webhook has been received, regardless of order, perform operations
    if (payloadCount === 1) {
      await redisInstance.set(`RE-${txHash}`, 2);

      const { rewardEventName } = getEventName(data.abi);

      if (!rewardEventName) {
        return res.status(500).json({ error: "Incorrect event name" });
      }

      //TODO - parse inputs;

      const decodedEvent = decodeEscrowRewardLogs(data, rewardEventName);

      if (!decodedEvent) {
        return res.status(500).json({ error: "Failed to decode event logs" });
      }

      const dbEvent = await createRewardEvent({
        escrowAddress: data.logs[0].address,
        eventName: rewardEventName,
        loyaltyAddress: decodedEvent.contractAddress,
        transactionHash: data.logs[0].transactionHash,
        userAddress: decodedEvent.user,
        timestamp: decodedEvent.rewardedAt,
        erc20Amount: decodedEvent.erc20Amount,
        tokenAmount: decodedEvent.tokenAmount,
        tokenId: decodedEvent.tokenId,
        escrowType: decodedEvent.escrowType,
      });

      await updateTotalsFromRewardEvents({
        eventName: rewardEventName,
        userAddress: decodedEvent.user,
        loyaltyAddress: dbEvent.loyaltyAddress,
        topics: {
          erc20Amount: decodedEvent.erc20Amount,
          tokenAmount: decodedEvent.tokenAmount,
          tokenId: decodedEvent.tokenId,
        },
        timestamp: decodedEvent.rewardedAt,
      });

      return res.status(200).json({ data: "TODO - success" });
    }

    return res.status(202).end();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
