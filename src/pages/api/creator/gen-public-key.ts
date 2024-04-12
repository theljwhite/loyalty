import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import {
  getExistingPublicKey,
  getExistingApiKeyByCreatorId,
} from "~/utils/apiUtils";
import { keyCreationHeadersSchema } from "~/utils/apiValidation";
import { createPublicKeyDerivative } from "~/utils/encryption";

const storePublicKey = async (
  rsaPublicKey: string,
  creatorId: string,
): Promise<boolean> => {
  try {
    const update = await db.user.update({
      where: { id: creatorId },
      data: { rsaPublicKey },
    });
    if (update.rsaPublicKey) return true;
  } catch (error) {
    return false;
  }
  return false;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerAuthSession({ req, res });

  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const input = keyCreationHeadersSchema.safeParse(req);

  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  const creatorId = String(req.headers["x-loyalty-creator-id"]);

  const existingApiKey = await getExistingApiKeyByCreatorId(creatorId);

  if (!existingApiKey) {
    return res.status(401).json({ message: "Must have a valid API key first" });
  }

  const existingPublicKey = await getExistingPublicKey(creatorId);

  if (existingPublicKey) {
    //TODO this may be changed depending on entire flow with,
    //managing the rotation of secrets
    return res.status(200).json({ message: "You already have a public key" });
  }

  const newPublicKey = createPublicKeyDerivative();

  if (!newPublicKey) {
    return res.status(500).json({ error: "Failed to generate public key" });
  }

  const dbDidUpdate = storePublicKey(newPublicKey, creatorId);

  if (!dbDidUpdate)
    return res.status(500).json({ error: "Internal Server Error. Try later." });

  return res.status(200).json({ publicKey: newPublicKey });
}
