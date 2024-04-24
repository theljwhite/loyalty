import { type NextApiRequest, type NextApiResponse } from "next";
import { id } from "ethers";
import { eventApiRouteSchema } from "~/utils/contractEventListener";
import { redisInstance } from "~/utils/apiValidation";

//TODO - unfinished (this will also prob not be done from this app, but elsewhere)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const input = eventApiRouteSchema.safeParse(req);

  console.log("req", req.body);

  // if (!input.success) {
  //   const errorMessages = input.error.issues.map((issue) => issue.message);
  //   return res.status(400).json({ error: errorMessages });
  // }

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

  if (!data.confirmed && !payloadCount) {
    await redisInstance.set(`CE-${signature}`, 1);
    return res.status(202).end();
  }

  if (data.confirmed && payloadCount !== 1) {
    await redisInstance.set(`CE-${signature}`, 1);
    return res.status(202).end();
  }

  if (data.confirmed && payloadCount === 1) {
    await redisInstance.set(`CE-${signature}`, 2);
    //TODO - finish logic here
  }

  return res.status(200).end();
}
