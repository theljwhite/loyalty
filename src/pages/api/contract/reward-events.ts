import { type NextApiRequest, type NextApiResponse } from "next";
import { redisInstance } from "~/utils/apiValidation";
import { id } from "ethers";
import {
  decodeEscrowRewardLogs,
  getEventName,
} from "~/utils/contractEventListener";

//TODO - parsing inputs commented out for now

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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

  console.log("REWARD EVENT PAYLOAD COUNT -->", payloadCount);

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

    const eventName = getEventName(data.abi);

    if (!eventName) {
      return res.status(500).json({ error: "Incorrect event name" });
    }

    //TODO - parse inputs;

    const relevantDataFromEvent = decodeEscrowRewardLogs(data, eventName);

    if (!relevantDataFromEvent) {
      return res.status(500).json({ error: "Failed to decode event logs" });
    }

    //TODO - store results in different db for tracking
    //await store(relevantDataFromEvent)

    return res.status(200).json({ data: "TODO - success" });
  }

  return res.status(202).end();
}
