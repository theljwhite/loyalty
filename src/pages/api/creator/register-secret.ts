import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";
import { secretHeadersSchema } from "~/utils/apiValidation";
import { storeEncryptedEntitySecretHash } from "~/utils/encryption";

//TODO - finish this here

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const input = secretHeadersSchema.safeParse(req);
  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  const session = await getServerAuthSession({ req, res });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const creatorId = String(req.headers["x-loyalty-creator-id"]);
  const entitySecretCipherText = req.body.entitySecretCipherText;

  const priv = process.env.LOADED_MASHED_POTATO ?? "";
  //private key will come from AWS KMS or hardware sec module or other solution;
  //or likely none of this will even be managed here (in this app at all)

  const base64Data = await storeEncryptedEntitySecretHash(
    entitySecretCipherText,
    creatorId,
    priv,
  );

  if (!base64Data) {
    return res.status(500).json({ error: "Failed to register entity secret" });
  }

  return res.status(200).json({ data: base64Data });
}
