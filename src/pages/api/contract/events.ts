import { type NextApiRequest, type NextApiResponse } from "next";
import { id } from "ethers";
import {
  decodeProgramEventLogs,
  eventApiRouteSchema,
  getEventName,
  parseEventReqBodyInputs,
} from "~/utils/contractEventListener";
import { redisInstance } from "~/utils/apiValidation";

//TODO - unfinished (this will also prob not be done from this app, but elsewhere)
//for now, may change it to perform operations only once a confirmed req is received

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const input = eventApiRouteSchema.safeParse(req);

  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  const signature = req.headers["x-signature"];

  const generatedSignature = id(
    JSON.stringify(req.body) + process.env.MORALIS_STREAM_SECRET,
  );
  if (signature !== generatedSignature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const data = req.body;

  const payloadCount: number | null = await redisInstance.get(
    `CE-${signature}`,
  );

  //handles the correct order of received webhooks (unconfirmed first, then confirmed)
  if (!data.confirmed && !payloadCount) {
    await redisInstance.set(`CE-${signature}`, 1);
    return res.status(202).end();
  }

  //handles incorrect order, if confirmed is sent before unconfirmed
  if (data.confirmed && payloadCount !== 1) {
    await redisInstance.set(`CE-${signature}`, 1);
    return res.status(202).end();
  }

  //as long as a prior webhook has been received, regardless of order, perform operations
  if (payloadCount === 1) {
    await redisInstance.set(`CE-${signature}`, 2);

    const eventName = getEventName(data.abi);

    if (!eventName) {
      return res.status(500).json({ error: "Incorrect event name" });
    }

    if (data.abi.length !== 1) {
      return res.status(500).json({ error: "Invalid abi length" });
    }

    const isValidInputs = parseEventReqBodyInputs(
      eventName,
      data.abi[0].inputs,
    );

    if (!isValidInputs) {
      return res.status(500).json({ error: "Invalid input properties" });
    }

    const relevantDataFromEvent = decodeProgramEventLogs(data, eventName);

    if (!relevantDataFromEvent) {
      return res.status(500).json({ error: "Failed to decode event logs" });
    }

    //TODO - store results in different db for tracking
    //await store(relevantDataFromEvent)

    return res.status(200).end();
  }

  return res.status(202).end();
}
