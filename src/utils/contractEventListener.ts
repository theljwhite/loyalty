import Moralis from "moralis";
import { z } from "zod";
import {
  type ObjectiveCompleteEvent,
  type PointsUpdateEvent,
  type ERC20RewardedEvent,
  type ERC721RewardedEvent,
  type ERC1155RewardedEvent,
} from "~/contractsAndAbis/Events/types";
import LPEventsAbi from "../contractsAndAbis/Events/LPEventsAbi.json";
import EscrowRewardEventsAbi from "../contractsAndAbis/Events/EscrowRewardEventsAbi.json";
import LoyaltyERC20Escrow from "../contractsAndAbis/0.03/ERC20Escrow/LoyaltyERC20Escrow.json";
import LoyaltyERC721Escrow from "../contractsAndAbis/0.03/ERC721Escrow/LoyaltyERC721Escrow.json";
import LoyaltyERC1155Escrow from "../contractsAndAbis/0.03/ERC1155Escrow/LoyaltyERC1155Escrow.json";

import LoyaltyProgram from "../contractsAndAbis/0.03/LoyaltyProgram/LoyaltyProgram.json";
import { Interface } from "ethers";

//TODO - decode logs can be made more dynamic if need be (if more events need to be listened to in future)

export type WithChainLogs = {
  contractAddress: string | `0x${string}`;
  chainId: number;
};

export type ProgramDecodedLogs = (ObjectiveCompleteEvent | PointsUpdateEvent) &
  WithChainLogs;

export type EscrowRewardDecodedLogs = (
  | ERC20RewardedEvent
  | ERC721RewardedEvent
  | ERC1155RewardedEvent
) &
  WithChainLogs;

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

export const getEventName = (abis: EventReqBodyAbiShape): string | null => {
  const onlyEvents = abis.filter((item) => item.type === "event");
  const matchingEvent = onlyEvents.find(
    (event) =>
      programEventNames.includes(event.name) ||
      escrowEventNames.includes(event.name),
  );
  return matchingEvent ? matchingEvent.name : null;
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

export const decodeProgramEventLogs = (
  data: EventRequestBody,
  eventName: string,
): ProgramDecodedLogs | null => {
  const lpInterface = new Interface(LoyaltyProgram.abi);

  const logs = data.logs.map(({ topic0, topic1, topic2, topic3, ...log }) => ({
    ...log,
    topics: [topic0 ?? "0x", topic1 ?? "0x", topic2 ?? "0x", topic3 ?? "0x"],
  }));

  const decodedLogs = logs.map((log) => lpInterface.parseLog(log));

  if (!decodedLogs || decodedLogs.length === 0) return null;

  if (eventName === "ObjectiveCompleted") {
    return {
      user: decodedLogs[0]?.args[0],
      objectiveIndex: Number(decodedLogs[0]?.args[1]),
      completedAt: new Date(Number(decodedLogs[0]?.args[2]) * 1000),
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
      updatedAt: new Date(decodedLogs[0]?.args[3]),
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
  const logs = data.logs.map(({ topic0, topic1, topic2, topic3, ...log }) => ({
    ...log,
    topics: [topic0 ?? "0x", topic1 ?? "0x", topic2 ?? "0x", topic3 ?? "0x"],
  }));

  if (eventName === "ERC20Rewarded") {
    const erc20EscrowInterface = new Interface(LoyaltyERC20Escrow.abi);
    const decodedLogs = logs.map((log) => erc20EscrowInterface.parseLog(log));

    return {
      user: decodedLogs[0]?.args[0],
      amount: decodedLogs[0]?.args[1],
      rewardedAt: new Date(Number(decodedLogs[0]?.args[2]) * 1000),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }

  if (eventName === "ERC721Rewarded") {
    const erc721EscrowInterface = new Interface(LoyaltyERC721Escrow.abi);
    const decodedLogs = logs.map((log) => erc721EscrowInterface.parseLog(log));

    return {
      user: decodedLogs[0]?.args[0],
      token: Number(decodedLogs[0]?.args[1]),
      rewardedAt: new Date(Number(decodedLogs[0]?.args[2])),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }

  if (eventName === "ERC1155Rewarded") {
    const erc1155EscrowInterface = new Interface(LoyaltyERC1155Escrow.abi);
    const decodedLogs = logs.map((log) => erc1155EscrowInterface.parseLog(log));

    return {
      user: decodedLogs[0]?.args[0],
      token: Number(decodedLogs[0]?.args[1]),
      amount: decodedLogs[0]?.args[2],
      rewardedAt: new Date(Number(decodedLogs[0]?.args[2])),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }

  return null;
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
    console.error("erro from add", error);
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
