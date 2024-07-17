import { circleChains, initiateCircleSdk } from "~/configs/circle";
import { relayChains } from "~/configs/openzeppelin";
import LoyaltyObjectivesAbi from "../contractsAndAbis/0.03/LoyaltyProgram/LoyaltyObjectivesAbi.json";
import LoyaltyProgram from "../contractsAndAbis/0.03/LoyaltyProgram/LoyaltyProgram.json";
import { type WalletResponse } from "@circle-fin/developer-controlled-wallets/dist/types/clients/developer-controlled-wallets";
import { db } from "~/server/db";
import { type ContractRunner, Contract } from "ethers";
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "@openzeppelin/defender-relay-client/lib/ethers";
import { handleError } from "./error";
import {
  Relayer,
  RelayerTransaction,
} from "@openzeppelin/defender-relay-client/lib/relayer";

// const {DefenderRelaySigner, Defend} = require("@openzeppelin/defender-relay-client/lib/ethers");

//can make a server side TRPC caller factory for these db procedures.
//so that this logic can be put inside a TRPC router like my handling for
//most other DB operations. but for first pass, this works for now.

//all of these prob dont need to go into individual try/catch's tho lol's.
//this is a first pass, can be cleaned up later on
//TODO: fix types

export const createDbWallet = async (
  walletSetId: string,
  externalUserId: string,
  walletAddress: string,
  walletId: string,
): Promise<{ address: string; refId: string; walletId: string } | null> => {
  if (!walletId || !walletAddress) return null;
  try {
    const update = await db.wallet.create({
      data: {
        externalId: externalUserId,
        address: walletAddress,
        isAssigned: false,
        walletSetId,
        walletId,
      },
    });
    if (update.walletSetId === walletSetId) {
      return {
        address: update.address,
        refId: update.refId,
        walletId: update.walletId,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const updateDbWalletSet = async (
  loyaltyAddress: string,
  walletSetId: string,
): Promise<string> => {
  try {
    const update = await db.loyaltyProgram.update({
      where: { address: loyaltyAddress },
      data: { walletSetId },
    });
    if (update.walletSetId === walletSetId) return update.walletSetId;
    return "";
  } catch (error) {
    return "";
  }
};

export const updateDbAssignWallet = async (refId: string): Promise<boolean> => {
  try {
    const update = await db.wallet.update({
      where: { refId },
      data: { isAssigned: true },
    });
    if (update.refId === refId) return true;
    return false;
  } catch (error) {
    return false;
  }
};

export const getWalletSetIdForProgram = async (
  loyaltyAddress: string,
): Promise<{ walletSetId: string; chainId: number } | undefined> => {
  const program = await db.loyaltyProgram.findUnique({
    where: { address: loyaltyAddress },
    select: { walletSetId: true, chainId: true },
  });

  if (!program || !program.walletSetId) return undefined;
  return { walletSetId: program.walletSetId, chainId: program.chainId };
};

export const getWalletDbRecord = async (
  externalUserId: string,
): Promise<
  | {
      walletId: string;
      refId: string;
    }
  | undefined
> => {
  try {
    const wallet = await db.wallet.findUnique({
      where: { externalId: externalUserId },
      select: { refId: true, walletId: true },
    });

    if (!wallet || wallet.walletId || !wallet.refId) return undefined;

    return { walletId: wallet.walletId, refId: wallet.refId };
  } catch (error) {
    return undefined;
  }
};

export const getWalletAddressByUserId = async (
  externalUserId: string,
): Promise<string | null> => {
  //TODO can possibly use refId (internal) instead of externalUserId.
  try {
    const wallet = await db.wallet.findUnique({
      where: { externalId: externalUserId },
      select: { address: true },
    });

    if (!wallet || !wallet.address) return null;

    return wallet.address;
  } catch (error) {
    return null;
  }
};

export const getUnassignedWalletsExternal = async (
  chainId: number,
  walletSetId: string,
): Promise<WalletResponse[] | null> => {
  const [circleChain] = circleChains.filter(
    (chain) => chain.chainId === chainId,
  );
  try {
    const circleDeveloperSdk = initiateCircleSdk();
    const response = await circleDeveloperSdk.listWallets({
      walletSetId,
      blockchain: circleChain?.chainName,
    });
    const walletList = response.data?.wallets;

    if (!response || !walletList) return null;

    const unassignedWallets = walletList.filter((wallet) => !wallet.refId);

    return unassignedWallets;
  } catch (error) {
    return null;
  }
};

export const assignExistingUnassignedWallet = async (
  chainId: number,
  walletSetId: string,
  externalUserId: string,
): Promise<string | null> => {
  const unassignedWallets = await getUnassignedWalletsExternal(
    chainId,
    walletSetId,
  );

  if (!unassignedWallets || unassignedWallets.length === 0) return null;

  const filteredByType = unassignedWallets?.filter((wallet) =>
    chainId === 1 ? wallet.accountType === "EOA" : wallet.accountType === "SCA",
  );

  if (!filteredByType || filteredByType.length === 0) return null;

  const lastUnassignedWallet = filteredByType[filteredByType.length - 1];
  if (!lastUnassignedWallet) return null;

  const walletAddress = lastUnassignedWallet.address;
  const walletId = lastUnassignedWallet.id;

  const dbWallet = await createDbWallet(
    walletSetId,
    externalUserId,
    walletAddress,
    walletId,
  );

  if (!dbWallet) return null;

  const assignedWalletAddress = await assignWalletCacheFlow(
    dbWallet.refId,
    dbWallet.walletId,
  );

  return assignedWalletAddress;
};

export const createWalletSet = async (
  loyaltyAddress: string,
  chainId: number,
): Promise<string> => {
  try {
    const circleDeveloperSdk = initiateCircleSdk();

    const firstTwo = loyaltyAddress.slice(2, 4);
    const lastFour = loyaltyAddress.slice(-4);
    const walletSetName = "Set" + firstTwo + lastFour + chainId;

    const response = await circleDeveloperSdk.createWalletSet({
      name: walletSetName,
    });

    if (!response.data) return "";

    if (
      response.data &&
      response.data.walletSet &&
      response.data.walletSet.id
    ) {
      const dbWalletSetId = await updateDbWalletSet(
        loyaltyAddress,
        response.data.walletSet.id,
      );

      if (!dbWalletSetId) return "";

      return dbWalletSetId;
    }
    return "";
  } catch (error) {
    return "";
  }
};

export const createWallet = async (
  loyaltyAddress: string,
  userId: string,
  accountType: "EOA" | "SCA",
): Promise<string | null> => {
  try {
    const program = await getWalletSetIdForProgram(loyaltyAddress);
    if (!program || !program.walletSetId) return null;

    const circleDeveloperSdk = initiateCircleSdk();
    const [circleChain] = circleChains.filter(
      (chain) => chain.chainId === program.chainId,
    );

    if (!circleChain) return null;

    const response = await circleDeveloperSdk.createWallets({
      accountType,
      blockchains: [circleChain.chainName],
      count: 1,
      walletSetId: program.walletSetId,
    });

    if (!response.data) return null;

    if (response && response.data && response.data.wallets) {
      const newWallet = response.data.wallets[0];

      const dbWallet = await createDbWallet(
        program.walletSetId,
        userId,
        newWallet?.address ?? "",
        newWallet?.id ?? "",
      );

      if (!dbWallet) return "";

      return dbWallet.address;
    }

    return "";
  } catch (error) {
    return "";
  }
};

export const createWalletCacheFlow = async (
  walletSetId: string,
  userId: string,
  chainId: number,
  accountType: "EOA" | "SCA",
): Promise<string | null> => {
  try {
    const circleDeveloperSdk = initiateCircleSdk();
    const [circleChain] = circleChains.filter(
      (chain) => chain.chainId === chainId,
    );

    if (!circleChain) return null;

    const response = await circleDeveloperSdk.createWallets({
      accountType,
      blockchains: [circleChain.chainName],
      count: 1,
      walletSetId: walletSetId,
    });

    if (!response || !response.data || !response.data.wallets) return null;

    if (
      response &&
      response.data &&
      response.data.wallets &&
      response.data.wallets.length > 0
    ) {
      const newWallet = response.data.wallets[0];

      const dbWallet = await createDbWallet(
        walletSetId,
        userId,
        newWallet?.address ?? "",
        newWallet?.id ?? "",
      );

      if (!dbWallet) return null;
      return dbWallet.address;
    }
    return null;
  } catch (error) {
    console.error("error from create wallet cache flow", error);
    return null;
  }
};

export const assignWalletCacheFlow = async (
  refId: string,
  walletId: string,
): Promise<string> => {
  try {
    const circleDeveloperSdk = initiateCircleSdk();

    const response = await circleDeveloperSdk.updateWallet({
      id: walletId,
      name: `${walletId.slice(0, 4)} Wallet`,
      refId,
    });

    if (
      response.data &&
      response.data.wallet?.refId &&
      response.data.wallet.refId === refId
    ) {
      return response.data.wallet.address ?? "";
    }

    return "";
  } catch (error) {
    console.error("error from assign wallet cache flow", error);
    return "";
  }
};

export const assignWallet = async (externalUserId: string): Promise<string> => {
  try {
    const circleDeveloperSdk = initiateCircleSdk();

    const walletDbRecord = await getWalletDbRecord(externalUserId);

    if (!walletDbRecord) return "";

    const response = await circleDeveloperSdk.updateWallet({
      id: walletDbRecord.walletId,
      refId: walletDbRecord.refId,
      name: `${walletDbRecord.refId.slice(0, 4)} Wallet`,
    });

    if (
      response.data &&
      response.data.wallet?.refId &&
      response.data.wallet.refId === walletDbRecord.refId
    ) {
      const didDbUpdate = await updateDbAssignWallet(walletDbRecord.refId);

      if (!didDbUpdate) return "";

      return response.data.wallet.address ?? "";
    }
    return "";
  } catch (error) {
    return "";
  }
};

//completing objectives transaction relaying

export const initOpenZepRelayer = (
  chainId: number,
): {
  provider: DefenderRelayProvider;
  signer: DefenderRelaySigner;
} => {
  const [relayChain] = relayChains.filter((chain) => chain.id === chainId);

  const credentials = {
    apiKey: relayChain?.relayerKey ?? "",
    apiSecret: relayChain?.relayerSecret ?? "",
  };

  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  });
  return { provider, signer };
};

export const createRelayerInfoClient = (chainId: number): Relayer => {
  const [relayChain] = relayChains.filter((chain) => chain.id === chainId);
  const relayer = new Relayer({
    apiKey: relayChain?.relayerKey ?? "",
    apiSecret: relayChain?.relayerSecret ?? "",
  });
  return relayer;
};

export const estimateRelayTransactionOutcome = async (
  loyaltyAddress: string,
  chainId: number,
  contractFnName: string,
  ...contractFnArgs: any[]
): Promise<{ data: any } | { error: string }> => {
  try {
    const { signer } = initOpenZepRelayer(chainId);

    const loyaltyProgramContract = new Contract(
      loyaltyAddress,
      LoyaltyProgram.abi,
      signer as unknown as ContractRunner,
    );

    const transaction = await loyaltyProgramContract[
      contractFnName
    ]?.staticCall(...contractFnArgs);

    return { data: transaction };
  } catch (error) {
    console.log("STATIC CALL ERROR", error);
    return { error: handleRelayTxErrors(error) };
  }
};

export const doRelayerTransaction = async (
  loyaltyAddress: string,
  chainId: number,
  contractFnName: string,
  ...contractFnArgs: any[]
): Promise<{ data: any } | { error: string }> => {
  try {
    const NUM_CONFIRMATIONS = 1;
    const TX_TIMEOUT = 300;

    const { provider, signer } = initOpenZepRelayer(chainId);

    const loyaltyProgramContract = new Contract(
      loyaltyAddress,
      LoyaltyProgram.abi,
      signer as unknown as ContractRunner,
    );

    const transaction = await loyaltyProgramContract[contractFnName]?.(
      ...contractFnArgs,
    );

    const receipt = await provider.waitForTransaction(
      transaction?.hash,
      NUM_CONFIRMATIONS,
      TX_TIMEOUT,
    );
    console.log("RELAYER TX RECEIPT", receipt);

    if (!receipt || receipt.status === 0) {
      return { error: "Transaction reverted" };
    }

    return { data: receipt };
  } catch (error) {
    console.log("RELAYER TX ERROR", error);
    return { error: handleRelayTxErrors(error) };
  }
};

export const queryRelayTransactionId = async (
  chainId: number,
  transactionId: string,
): Promise<RelayerTransaction> => {
  const relayer = createRelayerInfoClient(chainId);
  const transaction = await relayer.query(transactionId);
  return transaction;
};

export const listTransactions = async (
  chainId: number,
  options?: {
    sinceDate?: Date;
    status?: "pending" | "mined" | "failed";
    limit?: number;
  },
): Promise<typeof transactions> => {
  const relayer = createRelayerInfoClient(chainId);
  const transactions = await relayer.list(options && { ...options });
  return transactions;
};

export const handleRelayTxErrors = (error: any): string => {
  //TODO in future, handle possible errors better here
  const code = error?.code;
  const reason = error?.reason;
  const path = error?.request?.path;
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  let newErrorMessage: string = "";

  if (code === "CALL_EXCEPTION") {
    newErrorMessage = "Transaction likely would revert";
  }

  if (reason === "require(false)") {
    newErrorMessage = "Transaction would revert due to bad request";
  }

  if (
    status === 400 &&
    message.includes("Insufficient funds") &&
    path === "/txs"
  ) {
    newErrorMessage = "Insufficient relayer funds";
  }

  return newErrorMessage;
};
