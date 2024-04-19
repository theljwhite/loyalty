import { type NextApiRequest, type NextApiResponse } from "next";
import { secretRotateRequestSchema } from "~/utils/apiValidation";
import { getServerAuthSession } from "~/server/auth";
import {
  storeEncryptedEntitySecretHash,
  validateEntitySecretCipherText,
} from "~/utils/encryption";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const input = secretRotateRequestSchema.safeParse(req);
  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  const creatorId = String(req.headers["x-loyalty-creator-id"]);

  const session = await getServerAuthSession({ req, res });

  if (!session || session.user.id !== creatorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const entitySecretCipherText = req.body.entitySecretCipherText;
  const newCipherText = req.body.newEntitySecretCipherText;

  const TEMP_HASH_FROM_STORE = ""; //temporary before DB calls impl.

  const currCipherTextIsValid = validateEntitySecretCipherText(
    TEMP_HASH_FROM_STORE,
    entitySecretCipherText,
    process.env.LOADED_MASHED_POTATO ?? "", //temp hardcoded priv key
  );

  if (!currCipherTextIsValid) {
    return res
      .status(500)
      .json({ error: "Invalid current entity secret ciphertext" });
  }

  const newCipherMatchesCurrentHash = validateEntitySecretCipherText(
    TEMP_HASH_FROM_STORE,
    newCipherText,
    process.env.LOADED_MASHED_POTATO ?? "", //temp hardcoded priv key
  );

  //in this case, since a rotate is happening, if the hash of the new secret match the old it means that,
  //the encrypted entity secret did not change. it needs to for a reset.
  if (newCipherMatchesCurrentHash) {
    return res
      .status(500)
      .json({ error: "New ciphertext must utilize a new entity secret" });
  }

  if (newCipherMatchesCurrentHash === null) {
    return res.status(500).json({ error: "Failed to decrypt new ciphertext" });
  }

  const base64Data = await storeEncryptedEntitySecretHash(
    newCipherText,
    creatorId,
    process.env.LOADED_MASHED_POTATO ?? "", //temp hardcoded entity priv key
  );

  if (!base64Data) {
    return res.status(500).json({ error: "Failed to decrypt entity secret" });
  }

  return res.status(200).json({ data: base64Data });
}
