import { type NextApiRequest, type NextApiResponse } from "next";
import { db } from "~/server/db";
import forge from "node-forge";

export const verifyCreatorId = async (creatorId: string): Promise<boolean> => {
  const creator = await db.user.findUnique({
    where: { id: creatorId },
  });
  if (!creator) return false;
  return true;
};

export const validateApiRequestHeaders = (
  guardAdditional: boolean,
  headers: NextApiRequest["headers"],
  res: NextApiResponse,
): NextApiResponse | void => {
  const creatorApiKey = headers["x-loyalty-api-key"] ?? "";
  const entitySecret = headers["x-loyalty-entity-secret"] ?? "";

  if (!creatorApiKey || !entitySecret) {
    return res.status(400).json({ error: "Missing required headers" });
  }

  if (typeof creatorApiKey !== "string" || typeof entitySecret !== "string") {
    return res.status(400).json({ error: "Headers must be strings" });
  }

  const entitySecretLength = forge.util.hexToBytes(String(entitySecret)).length;
  if (entitySecretLength !== 32) {
    return res.status(400).json({
      error: "Entity secret incorrect length. Did you generate it correctly?",
    });
  }

  if (guardAdditional) {
    const version = headers["x-loyalty-version"];
    const backendAdapter = headers["x-loyalty-be-adapter"] ?? "";
    if (!version || !backendAdapter) {
      return res.status(400).json({ error: "Missing required headers" });
    }

    if (typeof version !== "string" || typeof backendAdapter !== "string") {
      return res.status(400).json({ error: "Headers must be strings" });
    }
  }
};
