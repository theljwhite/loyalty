import { type NextApiRequest, type NextApiResponse } from "next";
import forge from "node-forge";

//This is experimental

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  //TODO guard for only internal api call
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const publicKeyHeader = req.headers["x-loyalty-public-key"] ?? "";
  const entitySecretHeader = req.headers["x-loyalty-entity-secret"] ?? "";
  const apiKey = req.headers["x-loyalty-api-key"];

  if (!publicKeyHeader || !entitySecretHeader || !apiKey) {
    return res.status(400).json({ error: "Missing required headers" });
  }

  if (
    typeof publicKeyHeader !== "string" ||
    typeof entitySecretHeader !== "string" ||
    typeof apiKey !== "string"
  ) {
    return res.status(400).json({ error: "Headers must be strings" });
  }

  try {
    const entitySecret = forge.util.hexToBytes(entitySecretHeader);
    if (entitySecret.length !== 32) {
      return res
        .status(400)
        .json({ error: "Invalid entity secret. Must be a 32 byte string " });
    }

    const publicKey = forge.pki.publicKeyFromPem(publicKeyHeader);
    const encryptedData = publicKey.encrypt(entitySecret, "RSA-OAEP", {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() },
    });

    if (encryptedData) {
      return res.status(200).json({ data: encryptedData });
    }

    return res
      .status(500)
      .json({ error: "Failed to generate entity cipher text" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to generate entity cipher text" });
  }
}
