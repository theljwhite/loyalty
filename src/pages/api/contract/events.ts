import { type NextApiRequest, type NextApiResponse } from "next";
import { id } from "ethers";
import {
  decodeProgressionEvent,
  getEventName,
} from "~/utils/contractEventListener";
import { redisInstance } from "~/utils/apiValidation";
import {
  createProgressionEvent,
  updateTotalsFromProgressionEvents,
} from "~/utils/relayAnalytics";

//TODO - unfinished (this will also prob not be done from this app, but elsewhere)
//for now, parsing inputs is commented out

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    //TODO safe parse eventApiRouteSchema

    const signature = req.headers["x-signature"];

    const generatedSignature = id(
      JSON.stringify(req.body) + process.env.MORALIS_STREAM_SECRET,
    );
    if (signature !== generatedSignature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const data = req.body;
    const txHash = data.logs[0].transactionHash;

    const payloadCount: number | null = await redisInstance.get(`CE-${txHash}`);

    //handles the correct order of received webhooks (unconfirmed first, then confirmed)
    if (!data.confirmed && !payloadCount) {
      await redisInstance.set(`CE-${txHash}`, 1);
      return res.status(202).end();
    }

    //handles incorrect order, if confirmed is sent before unconfirmed
    if (data.confirmed && payloadCount !== 1) {
      await redisInstance.set(`CE-${txHash}`, 1);
      return res.status(202).end();
    }

    //as long as a prior webhook has been received, regardless of order, perform operations
    if (payloadCount === 1) {
      await redisInstance.set(`CE-${txHash}`, 2);

      const { progEventName } = getEventName(data.abi);

      if (!progEventName) {
        return res.status(500).json({ error: "Incorrect event name" });
      }

      //TODO parseEventReqBodyInputs

      const decodedEvent = decodeProgressionEvent(data, progEventName);

      if (!decodedEvent) {
        return res.status(500).json({ error: "Failed to decode event logs" });
      }

      await createProgressionEvent({
        eventName: progEventName,
        objectiveIndex: decodedEvent.objectiveIndex,
        userPointsTotal: decodedEvent.totalPoints,
        loyaltyAddress: decodedEvent.contractAddress,
        transactionHash: data.logs[0].transactionHash,
        userAddress: decodedEvent.user,
        timestamp: decodedEvent.timestamp,
      });

      await updateTotalsFromProgressionEvents({
        eventName: progEventName,
        userAddress: decodedEvent.user,
        loyaltyAddress: decodedEvent.contractAddress,
        timestamp: decodedEvent.timestamp,
      });

      return res.status(200).json({ data: "TODO - success" });
    }

    return res.status(202).end();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
