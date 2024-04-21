import { type NextApiRequest, type NextApiResponse } from "next";
import { secretRequestSchema } from "~/utils/apiValidation";
import { getServerAuthSession } from "~/server/auth";
import {
  storeEncryptedEntitySecretHash,
  validateCipherTextFromEncryptedHash,
  validateRecoveryFile,
  getEsHashByCreatorId,
} from "~/utils/encryption";

//TODO this as well as the other encrypted stuff prob wont be done from here
//experimental

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
  const creatorId = String(req.headers["x-loyalty-creator-id"]);

  if (!session || session.user.id !== creatorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const fileContent = req.body.fileContent;

  if (!fileContent || typeof fileContent !== "string") {
    return res.status(400).json({ error: "Missing file content" });
  }

  const isValid = await validateRecoveryFile(fileContent, creatorId);

  if (!isValid) {
    res.status(500).json({ error: "Failed to validate recovery file" });
  }

  const entitySecretCipherText = req.body.entitySecretCipherText;

  const base64StoredHash = await getEsHashByCreatorId(creatorId);

  if (!base64StoredHash) {
    return res
      .status(500)
      .json({ error: "You do not have an existing registered secret" });
  }

  const hashesDoMatch = validateCipherTextFromEncryptedHash(
    base64StoredHash,
    entitySecretCipherText,
    process.env.LOADED_MASHED_POTATO ?? "", //temp hardcoded priv key
  );

  if (hashesDoMatch === null) {
    return res.status(500).json({ error: "Failed to decrypt ciphertext" });
  }

  //in this case, since a reset is happening, if the hashes match it means that,
  //the encrypted entity secret did not change. it needs to for a reset.
  if (hashesDoMatch) {
    return res
      .status(500)
      .json({ error: "New ciphertext must utilize a new entity secret" });
  }

  const base64Data = await storeEncryptedEntitySecretHash(
    entitySecretCipherText,
    creatorId,
    process.env.LOADED_MASHED_POTATO ?? "", //temp hardcoded entity priv key
  );

  if (!base64Data) {
    return res.status(500).json({ error: "Failed to decrypt entity secret" });
  }

  return res.status(200).json({ data: base64Data });
}
