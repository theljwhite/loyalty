import { type NextApiRequest, type NextApiResponse } from "next";
import { id } from "ethers";

//TODO - unfinished

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  //TODO validation with zod

  const signature = req.headers["x-signature"];

  const generatedSignature = id(
    JSON.stringify(req.body) + process.env.MORALIS_API_KEY,
  );
  if (signature !== generatedSignature) {
    return res.status(400).json({ error: "Invalid signature" });
  }
}
