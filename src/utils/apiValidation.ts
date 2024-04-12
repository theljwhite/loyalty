import { db } from "~/server/db";
import forge from "node-forge";
import { z } from "zod";
import { Redis } from "@upstash/redis";
import { isAddress } from "ethers";
import { relayChains } from "~/configs/openzeppelin";
import { MAX_OBJECTIVES_LENGTH } from "~/constants/loyaltyConstants";
import { hashApiKey } from "./apiUtils";
import {
  assignExistingUnassignedWallet,
  createWalletCacheFlow,
  getWalletAddressByUserId,
} from "./transactionRelayUtils";

//This is experimental
//DB calls here can be moved to a TRPC router after a caller factory is made.
//so that the DB calls are in a router like most of the others throughout this project.

//all of this may be moved and not even done in this project
//this is to just get a flow down for REST api external use of the smart contracts.
//by developers on their own apps/websites.

export const redisInstance = new Redis({
  url: process.env.UPSTASH_URL ?? "",
  token: process.env.UPSTASH_REST_TOKEN ?? "",
});

export type ApiBasicHeaders = z.infer<typeof apiBasicHeadersSchema>;
export type RelayRequestSchema = z.infer<typeof relayRequestSchema>;

export type RelayTransactionResult = {
  contractWritten: boolean;
  generatedWallet: boolean;
  txReverted: boolean;
  walletError: boolean;
  networkError: boolean;
  unknownError: boolean;
  errorMessage?: string;
  status: number;
};

export type RelayIdempotencyMetadata<TPayload> = {
  timestamp: string;
  result: RelayTransactionResult;
  payload: TPayload;
  payloadChecksum?: string;
};

export type IdOrWallet = { userId?: string; userWalletAddress?: string };

export type ObjectivesIdempotencyPayload = {
  loyaltyContractAddress: string;
  objectiveIndex: number;
} & IdOrWallet;

export type GiveUserPointsIdempotencyPayload = {
  loyaltyContractAddress: string;
  pointsAmount: number;
} & IdOrWallet;

export const apiBasicHeadersSchema = z.object({
  headers: z.object({
    "x-loyalty-api-key": z.string().superRefine((key, ctx) => {
      const error = validateApiKeyShape(key);
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["x-loyalty-api-key"],
          message: error,
        });
      }
    }),
    "x-loyalty-entity-secret": z.string().superRefine((sec, ctx) => {
      const secretLength = forge.util.hexToBytes(sec).length;
      if (secretLength !== 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["x-loyalty-entity-secret"],
          message: "Entity secret incorrect length",
        });
      }
      return true;
    }),
    "x-loyalty-be-adapter": z.enum(["nextjs", "server-sdk", "express"]),
    "x-loyalty-address": z
      .string()
      .refine(isAddress, "Invalid loyalty address"),
    "x-loyalty-version": z.string(),
  }),
});

export const relayRequestSchema = z.object({
  headers: apiBasicHeadersSchema.shape.headers.extend({
    "x-idempotency-key": z.string().uuid(),
  }),
  body: z
    .object({
      objectiveIndex: z.number().min(0).max(MAX_OBJECTIVES_LENGTH),
      userWalletAddress: z
        .string()
        .refine(isAddress, "Invalid user wallet address")
        .optional(),
      userId: z.string().uuid().optional(),
      entitySecretCipherText: z.string().length(684),
    })
    .superRefine((b, ctx) => {
      if (b.userWalletAddress && b.userId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["userWalletAddress", "userId"],
          message: "Cannot pass both userWalletAddress and userId",
        });
      }
      if (!b.userWalletAddress && !b.userId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["userWalletAddress", "userId"],
          message: "Either userWalletAddress or userId must be provided",
        });
      }
      return true;
    }),
  query: z.object({
    chain: z.string().refine((chainId) => {
      return relayChains.some(
        (relayChain) => relayChain.id === Number(chainId),
      );
    }),
  }),
});

export const keyCreationHeadersSchema = z.object({
  headers: z.object({
    "x-loyalty-creator-id": z.string().cuid(),
    "x-loyalty-address": z
      .string()
      .refine(isAddress, "Invalid loyalty address"),
    "x-loyalty-chain": z.string().refine((chainId) => {
      return relayChains.some(
        (relayChain) => relayChain.id === Number(chainId),
      );
    }),
  }),
});

export const walletsValidationSchema = z.object({
  contractAddress: z.string().refine(isAddress, "Invalid ethereum address"),
  externalId: z.string().uuid(),
  refId: z.string().uuid(),
  walletId: z.string().uuid(),
  walletSetId: z.string(),
});

export const verifyCreatorId = async (creatorId: string): Promise<boolean> => {
  const creator = await db.user.findUnique({
    where: { id: creatorId },
  });
  if (!creator) return false;
  return true;
};

export const verifyLoyaltyProgram = async (
  loyaltyAddress: string,
  chainName: string,
): Promise<{
  chain: number;
  id: string | null;
}> => {
  const [relayChain] = relayChains.filter((chain) => chain.name === chainName);
  if (!relayChain) return { chain: 0, id: null };

  const loyaltyProgram = await db.loyaltyProgram.findUnique({
    where: { address: loyaltyAddress },
    select: { chainId: true, id: true },
  });

  if (!loyaltyProgram || !loyaltyProgram.chainId || !loyaltyProgram.id) {
    return { chain: 0, id: null };
  }

  return {
    chain: loyaltyProgram.chainId,
    id: loyaltyProgram.id,
  };
};

export const validateApiKeyShape = (reqApiKey: string): string => {
  if (!reqApiKey.startsWith("HN_TEST:") && !reqApiKey.startsWith("HN_MAIN:")) {
    return "Missing API key prefix";
  }

  const receivedChecksum = reqApiKey.split(":")[2];
  const apiKeyNoChecksum = reqApiKey.substring(0, reqApiKey.lastIndexOf(":"));
  const calculatedChecksum = forge.md.sha256.create();
  calculatedChecksum.update(apiKeyNoChecksum, "utf8");

  if (receivedChecksum !== calculatedChecksum.digest().toHex()) {
    return "Malformed authorization credentials";
  }

  return "";
};

export const validateKeyHandleCache = async (
  apiKeyHeader: string,
  loyaltyAddress: string,
): Promise<boolean> => {
  const hashedReceivedKey = hashApiKey(apiKeyHeader);
  const base64HashedKey = forge.util.encode64(hashedReceivedKey);

  try {
    const keyInCache = await redisInstance.get(`HN_${loyaltyAddress}`);

    if (!keyInCache) {
      const validKeyFromDb = await getProgramAndApiKey(
        hashedReceivedKey,
        loyaltyAddress,
      );

      if (!validKeyFromDb) return false;

      await redisInstance.set(`HN_${loyaltyAddress}`, base64HashedKey);
      await redisInstance.expire(`HN_${loyaltyAddress}`, 120);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const validateKeyCacheProgram = async (
  apiKeyHeader: string,
  loyaltyAddress: string,
): Promise<{
  keyValid: boolean;
  walletSetId: string | null;
  publicKey: string | null;
}> => {
  const hashedReceivedKey = hashApiKey(apiKeyHeader);
  const base64HashedKey = forge.util.encode64(hashedReceivedKey);

  try {
    const cacheResult: {
      key: string;
      walletSetId: string | null;
      publicKey: string | null;
    } | null = await redisInstance.get(`HN_${loyaltyAddress}`);

    if (!cacheResult) {
      const dbResult = await getProgramAndApiKey(
        hashedReceivedKey,
        loyaltyAddress,
      );

      if (!dbResult) {
        return { keyValid: false, walletSetId: null, publicKey: null };
      }

      await redisInstance.set(`HN_${loyaltyAddress}`, {
        key: base64HashedKey,
        walletSetId: dbResult.walletSetId,
        publicKey: dbResult.publicKey,
      });
      await redisInstance.expire(`HN_${loyaltyAddress}`, 120);

      return {
        keyValid: true,
        walletSetId: dbResult.walletSetId,
        publicKey: dbResult.publicKey,
      };
    }

    return {
      keyValid: cacheResult.key ? true : false,
      walletSetId: cacheResult.walletSetId,
      publicKey: cacheResult.publicKey,
    };
  } catch (error) {
    return { keyValid: false, walletSetId: null, publicKey: null };
  }
};

export const handleWalletCacheGenerateWallet = async (
  externalUserId: string,
  chainId: number,
  walletSetId: string,
): Promise<{ address: string; isNewWallet: boolean } | null> => {
  try {
    const cachedWallet: string | null = await redisInstance.get(
      `EU_${externalUserId}`,
    );

    if (!cachedWallet) {
      const dbWalletAddress = await getWalletAddressByUserId(externalUserId);
      if (!dbWalletAddress) {
        const unassignedWallet = await assignExistingUnassignedWallet(
          chainId,
          walletSetId,
          externalUserId,
        );

        if (!unassignedWallet) {
          const walletType = chainId === 1 ? "EOA" : "SCA";
          const generatedWalletAddress = await createWalletCacheFlow(
            walletSetId,
            externalUserId,
            chainId,
            walletType,
          );

          if (!generatedWalletAddress) return null;

          await redisInstance.set(
            `EU_${externalUserId}`,
            generatedWalletAddress,
          );
          return { address: generatedWalletAddress, isNewWallet: true };
        }

        await redisInstance.set(`EU_${externalUserId}`, unassignedWallet);
        return {
          address: unassignedWallet,
          isNewWallet: false,
        };
      }
      await redisInstance.set(`EU_${externalUserId}`, dbWalletAddress);
      return { address: dbWalletAddress, isNewWallet: false };
    }

    return { address: cachedWallet, isNewWallet: false };
  } catch (error) {
    return null;
  }
};

export const handleIdempotencyKeyAndCache = async <TPayload>(
  idempotencyKey: string,
  url: string,
  metadata: RelayIdempotencyMetadata<TPayload>,
): Promise<{
  response: RelayIdempotencyMetadata<TPayload>;
  status: number;
}> => {
  try {
    const payloadChecksum = doPayloadChecksum(metadata.payload);
    const metadataWithChecksum = { ...metadata, payloadChecksum };
    const fingerprint = `${url}-${idempotencyKey}`;
    const requestStatus = metadata.result.status;
    const fingerprintTTLSeconds = 86_400;
    const concurrentReqBufferMs = 120_000;

    const existingFingerprintData: RelayIdempotencyMetadata<TPayload> | null =
      await redisInstance.get(`IK_${fingerprint}`);

    if (existingFingerprintData) {
      if (payloadChecksum !== existingFingerprintData.payloadChecksum) {
        return { response: existingFingerprintData, status: 422 };
      }

      const existingReqTimeMs = new Date(
        existingFingerprintData.timestamp,
      ).getTime();
      const reqTimeMs = new Date(metadata.timestamp).getTime();

      if (reqTimeMs < existingReqTimeMs + concurrentReqBufferMs) {
        return { response: existingFingerprintData, status: 409 };
      }

      return { response: existingFingerprintData, status: requestStatus };
    }

    await redisInstance.set(`IK_${fingerprint}`, metadataWithChecksum);
    await redisInstance.expire(`IK_${fingerprint}`, fingerprintTTLSeconds);

    return { response: metadata, status: requestStatus };
  } catch (error) {
    return { response: metadata, status: 500 };
  }
};

export const handleApiResponseWithIdempotency = async <TPayload>(
  idempotencyKey: string,
  url: string,
  metadata: RelayIdempotencyMetadata<TPayload>,
): Promise<{
  data: RelayIdempotencyMetadata<TPayload>;
  status: number;
  errors: { title: string; details?: string }[];
}> => {
  let messageTitle: string = "";
  let messageDetail: string = "";

  const { response, status } = await handleIdempotencyKeyAndCache(
    idempotencyKey,
    url,
    metadata,
  );

  if (status === 422) {
    messageTitle = "Idempotency key is already used";
    messageDetail =
      "This operation is idempotent and it requires correct usage of idempotency key. Idempotency key must not be reused across different payloads of this operation";
  }
  if (status === 409) {
    messageTitle = "A request is outstanding for this idempotency key";
    messageDetail =
      "A request with the same idempotency key for the same operation is being processed or is outstanding";
  }

  const errors: { title: string; details?: string }[] = [];
  const errorFromRoute = response.result.errorMessage;

  if (errorFromRoute) errors.push({ title: errorFromRoute });
  if (messageTitle && messageDetail) {
    errors.push({ title: messageTitle, details: messageDetail });
  }

  return { data: response, status, errors };
};

export const doPayloadChecksum = <TPayload>(payload: TPayload): string => {
  const sha56 = forge.md.sha256.create();
  sha56.update(JSON.stringify(payload));
  return sha56.digest().toHex();
};

export const getProgramAndApiKey = async (
  hash: string,
  loyaltyAddress: string,
): Promise<{
  address: string;
  chain: string;
  chainId: number;
  walletSetId: string | null;
  publicKey: string;
} | null> => {
  const base64Hash = forge.util.encode64(hash);
  try {
    const user = await db.user.findUnique({
      where: { apiKey: base64Hash },
      select: {
        rsaPublicKey: true,
        loyaltyPrograms: {
          where: { address: loyaltyAddress },
          select: {
            chain: true,
            chainId: true,
            address: true,
            walletSetId: true,
          },
        },
      },
    });

    if (
      !user ||
      !user.rsaPublicKey ||
      !user.loyaltyPrograms ||
      user.loyaltyPrograms.length === 0
    ) {
      return null;
    }
    const program = user.loyaltyPrograms[0];

    if (!program || !program.address || !program.chain || !program.chainId) {
      return null;
    }

    return {
      address: program.address,
      chain: program.chain,
      chainId: program.chainId,
      walletSetId: program.walletSetId,
      publicKey: user.rsaPublicKey,
    };
  } catch (error) {
    return null;
  }
};
