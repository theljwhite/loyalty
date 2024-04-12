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

export const getExistingPublicKey = async (
  creatorId: string,
): Promise<string> => {
  const user = await db.user.findUnique({
    where: { id: creatorId },
    select: { rsaPublicKey: true },
  });

  if (!user || !user.rsaPublicKey) return "";

  return user.rsaPublicKey;
};

export const getExistingApiKeyByCreatorId = async (
  creatorId: string,
): Promise<string> => {
  const user = await db.user.findUnique({
    where: { id: creatorId },
    select: { apiKey: true },
  });

  if (!user || !user.apiKey) return "";

  return user.apiKey;
};

export const getPublicKeyByApiKey = async (
  apiKey: string,
): Promise<string | null> => {
  const hashedApiKey = hashApiKey(apiKey);
  const user = await db.user.findUnique({
    where: { apiKey: hashedApiKey },
    select: { rsaPublicKey: true },
  });
  if (!user || !user.rsaPublicKey) return "";

  return user.rsaPublicKey;
};
