import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { verifyCreatorId } from "~/utils/apiValidation";


//can also add creatorAddress to this (along with creatorId);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(500).json({ error: "Method not allowed" });
  }

  const { creatorId, creatorAddress, loyaltyAddress } = req.body;

  if (!creatorId || !creatorAddress || !loyaltyAddress) {
    return res.status(400).json({ error: "Missing argument" });
  }

  const creatorVerified = await verifyCreatorId(creatorId);

  if (!creatorVerified) {
    return res.status(401).json({ error: "Creator not authorized" });
  }


  const jwtPayload = {
    creatorId,
    creatorAddress,
    loyaltyAddress,
  };

  const apiKey = jwt.sign(jwtPayload, process.env.CREATOR_JWT_SECRET ?? "", {
    expiresIn: "5m",
    algorithm: "RS256",
  });

  return res.status(200).json({ apiKey });
}
