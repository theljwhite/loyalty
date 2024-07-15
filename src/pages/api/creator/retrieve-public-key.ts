import { NextApiRequest, NextApiResponse } from "next";
import { getPublicKeyByApiKey } from "~/utils/apiUtils";
import { apiBasicHeadersSchema } from "~/utils/apiValidation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("REACHED");
  const input = apiBasicHeadersSchema.safeParse(req);

  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  const apiKey = String(req.headers["x-loyalty-api-key"]);

  const publicKey = await getPublicKeyByApiKey(apiKey);

  if (!publicKey) {
    return res.status(500).json({ error: "Failed to fetch public key" });
  }

  return res.status(200).json({ data: { publicKey } });
}
