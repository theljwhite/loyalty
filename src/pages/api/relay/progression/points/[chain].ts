import { type NextApiRequest, type NextApiResponse } from "next";
import {
  validateKeyCacheProgram,
  handleWalletCacheGenerateWallet,
  pointsRequestSchema,
  handleApiResponseWithIdempotency,
  type PointsIdempotencyPayload,
  type RelayTransactionResult,
  type RelayIdempotencyMetadata,
} from "~/utils/apiValidation";
import {
  estimateRelayTransactionOutcome,
  doRelayerTransaction,
} from "~/utils/transactionRelayUtils";
import { getEsHashByApiKey } from "~/utils/apiUtils";
import { validateCipherTextFromEncryptedHash } from "~/utils/encryption";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const input = pointsRequestSchema.safeParse(req);

  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  const apiKey = String(req.headers["x-loyalty-api-key"]);
  const loyaltyContractAddress = String(req.headers["x-loyalty-address"]);
  const idempotencyKey = String(req.headers["x-idempotency-key"]);

  const body = req.body;
  const userWalletAddress = body.userWalletAddress;
  const userId = body.userId;
  const pointsAmount = body.pointsAmount;
  const entitySecretCipherText = body.entitySecretCipherText;

  const { chain } = req.query;
  const chainId = Number(chain);

  const program = await validateKeyCacheProgram(apiKey, loyaltyContractAddress);

  if (!program.keyValid) {
    return res
      .status(401)
      .json({ error: "Malformed authorization credentials" });
  }

  if (!program.publicKey) {
    return res.status(401).json({ error: "Could not fetch entity public key" });
  }

  //TEMP
  const base64StoredEsHash = await getEsHashByApiKey(apiKey);
  const isCipherTextValid = validateCipherTextFromEncryptedHash(
    base64StoredEsHash,
    entitySecretCipherText,
    process.env.LOADED_MASHED_POTATO ?? "", //hardcoded entity priv key for now,
  );

  if (!isCipherTextValid) {
    return res.status(401).json({ error: "Invalid ciphertext" });
  }
  //END TEMP

  const mayNeedWalletGenerated = userId && !userWalletAddress;
  const relayResult: RelayTransactionResult = {
    contractWritten: false,
    generatedWallet: false,
    staticCallPass: true,
    txReverted: false,
    walletError: false,
    networkError: false,
    unknownError: false,
    errorMessage: "",
    status: 0,
  };

  const idempotencyPayload: PointsIdempotencyPayload = {
    userId,
    userWalletAddress,
    loyaltyContractAddress,
    pointsAmount,
  };

  const idempotencyMetadata: RelayIdempotencyMetadata<PointsIdempotencyPayload> =
    {
      timestamp: new Date().toISOString(),
      result: relayResult,
      payload: idempotencyPayload,
    };

  if (mayNeedWalletGenerated && !program.walletSetId) {
    const message = "No wallet set found for program";
    relayResult.walletError = true;
    relayResult.errorMessage = message;
    relayResult.status = 503;
    return res.status(503).json({ error: message });
  }

  try {
    let pointsEarnerAddress: string = userWalletAddress;

    if (mayNeedWalletGenerated) {
      const walletAgent = await handleWalletCacheGenerateWallet(
        userId,
        chainId,
        program.walletSetId ?? "",
      );

      if (!walletAgent) {
        relayResult.walletError = true;
        relayResult.errorMessage = "Failed to fetch or generate wallet agent";
        relayResult.status = 500;
        const { data, status, errors } = await handleApiResponseWithIdempotency(
          idempotencyKey,
          req.url ?? "",
          idempotencyMetadata,
        );
        return res.status(status).json({ data, error: errors });
      }
      relayResult.generatedWallet = walletAgent.isNewWallet;
      pointsEarnerAddress = walletAgent.address;
    }

    const staticCallRes = await estimateRelayTransactionOutcome(
      loyaltyContractAddress,
      Number(chainId),
      "givePointsToUser",
      pointsEarnerAddress,
      pointsAmount,
    );

    if ("error" in staticCallRes) {
      relayResult.errorMessage = staticCallRes.error;
      relayResult.staticCallPass = false;
      relayResult.status = 500;
      const { data, status, errors } = await handleApiResponseWithIdempotency(
        idempotencyKey,
        req.url ?? "",
        idempotencyMetadata,
      );
      return res.status(status).json({ data, error: errors });
    }

    const relayTx = await doRelayerTransaction(
      loyaltyContractAddress,
      Number(chainId),
      "givePointsToUser",
      pointsEarnerAddress,
      pointsAmount,
    );

    if ("error" in relayTx) {
      relayResult.errorMessage = relayTx.error;
      relayResult.status = 500;
      const { data, status, errors } = await handleApiResponseWithIdempotency(
        idempotencyKey,
        req.url ?? "",
        idempotencyMetadata,
      );
      return res.status(status).json({ data, error: errors });
    }

    relayResult.status = 200;
    relayResult.contractWritten = true;

    const { data, status } = await handleApiResponseWithIdempotency(
      idempotencyKey,
      req.url ?? "",
      idempotencyMetadata,
    );
    const dataWithTxReceipt = { data: { ...data, receipt: relayTx.data } };

    return res.status(status).json({ dataWithTxReceipt });
  } catch (error) {
    relayResult.unknownError = true;
    relayResult.errorMessage = "Internal Server Error";
    relayResult.status = 500;
    const { status, errors } = await handleApiResponseWithIdempotency(
      idempotencyKey,
      req.url ?? "",
      idempotencyMetadata,
    );
    return res.status(status).json({ error: errors });
  }
}
