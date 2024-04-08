import { type NextApiRequest, type NextApiResponse } from "next";
import { relayChains } from "~/configs/openzeppelin";
import { isHashCollision } from "~/utils/apiUtils";
import forge from "node-forge";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

//TODO this is experimental and keys can be handled more securely,
//either through Supabase itself or a vault

const storeApiKey = async (
  hash: string,
  creatorId: string,
): Promise<boolean> => {
  try {
    const update = await db.user.update({
      where: { id: creatorId },
      data: { apiKey: hash, apiKeyUpdatedAt: new Date() },
    });
    if (update.apiKey) return true;
    return false;
  } catch (error) {
    return false;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerAuthSession({ req, res });

  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const creatorId = req.headers["x-loyalty-creator-id"];
  const loyaltyContractAddress = req.headers["x-loyalty-address"];
  const loyaltyContractChainName = req.headers["x-loyalty-chain"];

  if (!creatorId || !loyaltyContractAddress || !loyaltyContractChainName) {
    return res.status(400).json({ error: "Missing required headers" });
  }

  if (
    typeof creatorId !== "string" ||
    typeof loyaltyContractAddress !== "string" ||
    typeof loyaltyContractChainName !== "string"
  ) {
    return res.status(400).json({ error: "Headers should be strings" });
  }

  try {
    const [relayChain] = relayChains.filter(
      (chain) => chain.name === loyaltyContractChainName,
    );

    if (!relayChain) {
      return res.status(400).json({ error: "Not a valid chain" });
    }

    const isTestnet = relayChain.isTestChain;
    const base64Key = process.env.LOADED_BAKED_POTATO;
    const dev = process.env.NODE_ENV !== "production";

    if (!base64Key) throw new Error("Could not bake potatos");

    const key = forge.util.decode64(base64Key);

    const iv = forge.random.getBytesSync(16);
    const cipher = forge.cipher.createCipher("AES-CBC", key);

    cipher.start({ iv });
    // cipher.update(forge.util.createBuffer(cipherPayload, "utf8"));
    cipher.finish();

    const base = cipher.output.toHex();
    const prefix = dev || isTestnet ? "HN_TEST:" : "HN_MAIN:";
    const checksum = forge.md.sha256.create();
    checksum.update(prefix + base, "utf8");

    const checksumValue = checksum.digest().toHex();
    const apiKeyWithChecksum = `${prefix + base}:${checksumValue}`;

    const hash = forge.md.sha256.create();
    hash.update(apiKeyWithChecksum);
    const hashedApiKey = hash.digest().toHex();
    const isCollision = await isHashCollision(hashedApiKey);

    if (isCollision) throw new Error();

    const base64HashedApiKey = forge.util.encode64(hashedApiKey);

    if (!isCollision) storeApiKey(base64HashedApiKey, creatorId);

    return res.status(200).json({ apiKey: apiKeyWithChecksum });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate api key" });
  }
}
