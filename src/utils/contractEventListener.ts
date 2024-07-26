import Moralis from "moralis";
import { z } from "zod";
import {
  type ProgressionEventName,
  type RewardEventName,
} from "~/server/api/routers/events";
import { Interface } from "ethers";
import { type EscrowType } from "@prisma/client";
import {
  OBJ_COMPLETE_SIG,
  POINTS_UPDATE_SIG,
  ERC20_REWARDED_SIG,
  ERC721_REWARDED_SIG,
  ERC1155_REWARDED_SIG,
} from "~/contractsAndAbis/Events/eventSignatures";
import LPEventsAbi from "../contractsAndAbis/Events/LPEventsAbi.json";
import EscrowRewardEventsAbi from "../contractsAndAbis/Events/EscrowRewardEventsAbi.json";
import LoyaltyERC20Escrow from "../contractsAndAbis/0.03/ERC20Escrow/LoyaltyERC20Escrow.json";
import LoyaltyERC721Escrow from "../contractsAndAbis/0.03/ERC721Escrow/LoyaltyERC721Escrow.json";
import LoyaltyERC1155Escrow from "../contractsAndAbis/0.03/ERC1155Escrow/LoyaltyERC1155Escrow.json";
import LoyaltyProgram from "../contractsAndAbis/0.03/LoyaltyProgram/LoyaltyProgram.json";

//TODO - decode logs can be made more dynamic if need be (if more events need to be listened to in future)

export type WithChainLogs = {
  contractAddress: string | `0x${string}`;
  chainId: number;
};

export type ProgressionDecodedLogs = {
  user: string;
  timestamp: number;
  totalPoints: number;
  objectiveIndex?: number;
  amount?: number;
} & WithChainLogs;

export type EscrowRewardDecodedLogs = {
  user: string;
  rewardedAt: number;
  erc20Amount?: bigint;
  tokenAmount?: number;
  tokenId?: number;
  escrowType: EscrowType;
} & WithChainLogs;

type EventRequestBody = z.infer<typeof eventApiRouteSchema.shape.body>;
type EventInputs = z.infer<typeof eventReqBodyInputsShape>;
type EventReqBodyAbiShape = z.infer<typeof eventReqBodyAbiShape>;

export const programEventNames = LPEventsAbi.map((event) => event.name);
export const escrowEventNames = EscrowRewardEventsAbi.map(
  (event) => event.name,
);

const eventReqBodyParamsEmptyArray = z.array(z.any()).length(0);
const eventReqBodyInputsShape = z.array(
  z.object({
    type: z.string(),
    name: z.string(),
    indexed: z.boolean(),
    internalType: z.string().optional(),
  }),
);
const eventReqBodyAbiShape = z.array(
  z.object({
    name: z.string(),
    type: z.string(),
    anonymous: z.boolean(),
    inputs: eventReqBodyInputsShape,
  }),
);

export const eventApiRouteSchema = z.object({
  headers: z.object({
    "x-signature": z.string(),
  }),
  body: z.object({
    tag: z.literal("PROGRESS_STREAM_ONE"),
    chainId: z.string(),
    confirmed: z.boolean(),
    block: z.object({
      number: z.string(),
      hash: z.string(),
      timestamp: z.string(),
    }),
    txs: z.array(z.any()),
    abi: eventReqBodyAbiShape,
    logs: z.array(
      z.object({
        logIndex: z.string(),
        transactionHash: z.string(),
        address: z.string(),
        data: z.string(),
        topic0: z.string(),
        topic1: z.string(),
        topic2: z.string(),
        topic3: z.string(),
      }),
    ),
    streamId: z.string(),
    retries: z.number(),
    txsInternal: eventReqBodyParamsEmptyArray,
    erc20Transfers: eventReqBodyParamsEmptyArray,
    erc20Approvals: eventReqBodyParamsEmptyArray,
    nftTransfers: eventReqBodyParamsEmptyArray,
    nativeBalances: z.array(z.any()),
    nftTokenApprovals: z.array(z.any()),
    nftApprovals: z.object({
      ERC1155: eventReqBodyParamsEmptyArray,
      ERC721: eventReqBodyParamsEmptyArray,
    }),
  }),
});

export const parseEventReqBodyInputs = (
  eventName: string,
  inputs: EventInputs,
): boolean => {
  const parsedInputTypes = eventReqBodyInputsShape.safeParse(inputs);

  if (!parsedInputTypes.success) return false;

  const correctInputValues = getAbiEventInputs(eventName);
  if (!correctInputValues) return false;

  const valuesMatch = inputs.every((item, index) => {
    const correctInput = correctInputValues[index];
    return (
      item.type === correctInput?.type &&
      item.name === correctInput?.name &&
      item.indexed === correctInput?.indexed
    );
  });

  return valuesMatch;
};

// - TODO there needs to be an easier way to get the name of the emitted event lol. odd.
// - this should not require any additional work tbh.
// - (Moralis says eventually stream data will contain the event name)
// - so this prob temporary and will be changed, thats why kinda hardcoded for now
export const getEventName = (
  logs: EventRequestBody["logs"],
): {
  progEventName: ProgressionEventName | null;
  rewardEventName: RewardEventName | null;
} => {
  let progEvent: ProgressionEventName | null = null;
  let rewardEvent: RewardEventName | null = null;
  const topic0 = logs[0]?.topic0;

  if (topic0 === OBJ_COMPLETE_SIG) progEvent = "ObjectiveCompleted";
  if (topic0 === POINTS_UPDATE_SIG) progEvent = "PointsUpdate";
  if (topic0 === ERC20_REWARDED_SIG) rewardEvent = "ERC20Rewarded";
  if (topic0 === ERC721_REWARDED_SIG) rewardEvent = "ERC721Rewarded";
  if (topic0 === ERC1155_REWARDED_SIG) rewardEvent = "ERC1155Rewarded";

  return {
    progEventName: progEvent,
    rewardEventName: rewardEvent,
  };
};

const getAbiEventInputs = (eventName: string): EventInputs | null => {
  const relevantProgramEvent = LPEventsAbi.find(
    (event) => event.name === eventName,
  );
  if (relevantProgramEvent) return relevantProgramEvent.inputs;

  const relevantEscrowEvent = EscrowRewardEventsAbi.find(
    (event) => event.name === eventName,
  );
  if (relevantEscrowEvent) return relevantEscrowEvent.inputs;
  return null;
};

export const decodeProgressionEvent = (
  data: EventRequestBody,
  eventName: string,
): ProgressionDecodedLogs | null => {
  const lpInterface = new Interface(LoyaltyProgram.abi);

  const logs = moralisLogsToEthers(data);

  const decodedLogs = logs.map((log) => lpInterface.parseLog(log));

  if (!decodedLogs || decodedLogs.length === 0) return null;

  if (eventName === "ObjectiveCompleted") {
    return {
      user: decodedLogs[0]?.args[0],
      objectiveIndex: Number(decodedLogs[0]?.args[1]),
      timestamp: decodedLogs[0]?.args[2],
      totalPoints: Number(decodedLogs[0]?.args[3]),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }

  if (eventName === "PointsUpdate") {
    return {
      user: decodedLogs[0]?.args[0],
      totalPoints: Number(decodedLogs[0]?.args[1]),
      amount: Number(decodedLogs[0]?.args[2]),
      timestamp: decodedLogs[0]?.args[3],
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }
  return null;
};

export const decodeEscrowRewardLogs = (
  data: EventRequestBody,
  eventName: string,
): EscrowRewardDecodedLogs | null => {
  const logs = moralisLogsToEthers(data);

  if (eventName === "ERC20Rewarded") {
    const erc20EscrowInterface = new Interface(LoyaltyERC20Escrow.abi);
    const decodedLogs = logs.map((log) => erc20EscrowInterface.parseLog(log));

    return {
      user: decodedLogs[0]?.args[0],
      erc20Amount: decodedLogs[0]?.args[1],
      rewardedAt: Number(decodedLogs[0]?.args[2]),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
      escrowType: "ERC20",
    };
  }

  if (eventName === "ERC721Rewarded") {
    const erc721EscrowInterface = new Interface(LoyaltyERC721Escrow.abi);
    const decodedLogs = logs.map((log) => erc721EscrowInterface.parseLog(log));

    return {
      user: decodedLogs[0]?.args[0],
      tokenId: Number(decodedLogs[0]?.args[1]),
      rewardedAt: Number(decodedLogs[0]?.args[2]),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
      escrowType: "ERC721",
    };
  }

  if (eventName === "ERC1155Rewarded") {
    const erc1155EscrowInterface = new Interface(LoyaltyERC1155Escrow.abi);
    const decodedLogs = logs.map((log) => erc1155EscrowInterface.parseLog(log));

    return {
      user: decodedLogs[0]?.args[0],
      tokenId: Number(decodedLogs[0]?.args[1]),
      tokenAmount: decodedLogs[0]?.args[2],
      rewardedAt: Number(decodedLogs[0]?.args[2]),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
      escrowType: "ERC1155",
    };
  }

  return null;
};

const moralisLogsToEthers = (
  data: EventRequestBody,
): {
  topics: string[];
  data: string;
  logIndex: string;
  transactionHash: string;
  address: string;
}[] => {
  const logs = data.logs.map(({ topic0, topic1, topic2, topic3, ...log }) => ({
    ...log,
    topics: [topic0 ?? "0x", topic1 ?? "0x", topic2 ?? "0x", topic3 ?? "0x"],
  }));
  return logs;
};

export const addContractAddressToStream = async (
  loyaltyAddresses: string[],
): Promise<boolean> => {
  try {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
      });
    }
    const response = await Moralis.Streams.addAddress({
      id: process.env.NEXT_PUBLIC_MORALIS_STREAM_ID_ONE ?? "",
      address: loyaltyAddresses,
    });

    if (response && response.result) return true;

    return false;
  } catch (error) {
    return false;
  }
};

export const deleteContractAddressFromStream = async (
  loyaltyAddresses: string[],
): Promise<boolean> => {
  try {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
      });
    }

    const response = await Moralis.Streams.deleteAddress({
      id: process.env.NEXT_PUBLIC_MORALIS_STREAM_ID_ONE ?? "",
      address: loyaltyAddresses,
    });

    if (response && response.result) return true;

    return false;
  } catch (error) {
    return false;
  }
};
