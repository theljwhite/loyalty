import { db } from "~/server/db";
import jwt from "jsonwebtoken";

export const validateCreatorApiKey = (apiKey: string): boolean => {
  try {
    jwt.verify(apiKey, process.env.CREATOR_JWT_SECRET ?? "");
    return true;
  } catch (error) {
    return false;
  }
};

export const verifyCreatorId = async (creatorId: string): Promise<boolean> => {
  const creator = await db.user.findUnique({
    where: { id: creatorId },
  });
  if (!creator) return false;
  return true;
};


