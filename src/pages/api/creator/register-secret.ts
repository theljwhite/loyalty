import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";
import { secretRequestSchema } from "~/utils/apiValidation";
import { storeEncryptedEntitySecretHash } from "~/utils/encryption";

//TODO - this wont be done from an api route prob

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const input = secretRequestSchema.safeParse(req);
  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  const session = await getServerAuthSession({ req, res });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const creatorId = String(req.headers["x-loyalty-creator-id"]);
  const entitySecretCipherText = req.body.entitySecretCipherText;

  const base64Data = await storeEncryptedEntitySecretHash(
    entitySecretCipherText,
    creatorId,
    process.env.LOADED_MASHED_POTATO ?? "", //temp hardcoded entity priv key
  );

  if (!base64Data) {
    return res.status(500).json({ error: "Failed to register entity secret" });
  }

  console.log("base64 data is", base64Data);
  return res.status(200).json({ data: base64Data });
}
