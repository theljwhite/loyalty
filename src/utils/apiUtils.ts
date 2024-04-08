import { db } from "~/server/db";
import forge from "node-forge";
import { Redis } from "@upstash/redis";

export const isHashCollision = async (hash: string): Promise<boolean> => {
  const base64Hash = forge.util.encode64(hash);
  try {
    const count = await db.user.count({ where: { apiKey: base64Hash } });
    return count > 0;
  } catch (error) {
    return true;
  }
};

export const hashApiKey = (apiKey: string) => {
  const sha256 = forge.md.sha256.create();
  sha256.update(apiKey);
  return sha256.digest().toHex();
};
