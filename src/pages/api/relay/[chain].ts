import { type NextApiRequest, type NextApiResponse } from "next";
import {
  relayRequestSchema,
  validateKeyCacheProgram,
  handleWalletCacheGenerateWallet,
  type ObjectivesIdempotencyPayload,
  type RelayIdempotencyMetadata,
  type RelayTransactionResult,
  handleApiResponseWithIdempotency,
} from "../../../utils/apiValidation";
import {
  estimateRelayTransactionOutcome,
  relayerCompleteObjective,
} from "~/utils/transactionRelayUtils";
import { getEsHashByApiKey } from "~/utils/apiUtils";
import { validateCipherTextFromEncryptedHash } from "~/utils/encryption";

//TODO: this is strictly for experimentation right now
//all of the caching utility funcs imported here from apiValid,
//may have to split cache DB's for them. rn it is using the same redis DB.

//this architecture (lol) may be changed, this is just to get a flow down.
//as in, at least this app's NextJS api routes prob wont be used as REST API
//itll be moved elsewhere. same with the encryption aspects.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const input = relayRequestSchema.safeParse(req);

  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  const apiKey = String(req.headers["x-loyalty-api-key"]);
  const loyaltyContractAddress = String(req.headers["x-loyalty-address"]);
  const idempotencyKey = String(req.headers["x-idempotency-key"]);
  const version = String(req.headers["x-loyalty-version"]);
  const backendAdapter = String(req.headers["x-loyalty-be-adapter"]);

  const body = req.body;
  const userWalletAddress = body.userWalletAddress;
  const userId = body.userId;
  const objectiveIndex = body.objectiveIndex;
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

  //TODO - change priv key below once implemented
  //these calls can be consolidated with the others above and cached (validateKeyCacheProgram)

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
    txReverted: false,
    walletError: false,
    networkError: false,
    unknownError: false,
    errorMessage: "",
    status: 0,
  };

  const idempotencyPayload: ObjectivesIdempotencyPayload = {
    userId,
    userWalletAddress,
    loyaltyContractAddress,
    objectiveIndex,
  };
  const idempotencyMetadata: RelayIdempotencyMetadata<ObjectivesIdempotencyPayload> =
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
    let completingObjectiveAddress: string = userWalletAddress;

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
      completingObjectiveAddress = walletAgent.address;
    }

    const txReceipt = await relayerCompleteObjective(
      objectiveIndex,
      completingObjectiveAddress,
      loyaltyContractAddress,
      Number(chainId),
    );

    // const txReceipt = await estimateRelayTransactionOutcome(
    //   objectiveIndex,
    //   completingObjectiveAddress,
    //   loyaltyContractAddress,
    //   Number(chainId),
    // );

    if ("error" in txReceipt) {
      relayResult.errorMessage = txReceipt.error;
      relayResult.status = 500;
      const { data, status, errors } = await handleApiResponseWithIdempotency(
        idempotencyKey,
        req.url ?? "",
        idempotencyMetadata,
      );
      return res.status(status).json({ data, error: errors });
    }

    relayResult.contractWritten = "error" in txReceipt ? false : true;
    relayResult.status = 200;

    const { data, status } = await handleApiResponseWithIdempotency(
      idempotencyKey,
      req.url ?? "",
      idempotencyMetadata,
    );
    const dataWithTxReceipt = { ...data, receipt: txReceipt };
    return res.status(status).json(dataWithTxReceipt);
  } catch (error) {
    console.error("error from serv -->", error);
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
