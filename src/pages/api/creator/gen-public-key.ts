import { type NextApiRequest, type NextApiResponse } from "next";
import forge from "node-forge";
import { validateApiRequestHeaders } from "~/utils/apiValidation";

//This is experimental

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const creatorApiKey = req.headers["x-loyalty-api-key"] ?? "";
  const walletAddress = req.body.walletAddress;

  validateApiRequestHeaders(false, req.headers, res);
  //validateApiKey(creatorApiKey, walletAddress)

  const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);

  res.status(200).json({ publicKey: publicKeyPem });
}
