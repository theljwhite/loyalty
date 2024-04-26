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
type EventRequestInputs = z.infer<typeof eventReqBodyInputsShape>;
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
    nftTokenApprovals: z.any(),
    nftApprovals: z.object({
      ERC1155: eventReqBodyParamsEmptyArray,
      ERC721: eventReqBodyParamsEmptyArray,
    }),
  }),
});

export const parseEventReqBodyInputs = (
  eventName: string,
  inputs: EventRequestInputs,
): boolean => {
  const parsedInputTypes = eventReqBodyInputsShape.safeParse(inputs);

  if (!parsedInputTypes.success) return false;

  const isProgramEvent = programEventNames.includes(eventName);
  const isEscrowEvent = escrowEventNames.includes(eventName);

  let correctInputsValues: EventRequestInputs = [];

  if (isProgramEvent) {
    const matchingProgramEvent = LPEventsAbi.find(
      (item) => item.name === eventName,
    );
    correctInputsValues = matchingProgramEvent?.inputs ?? [];
  }

  if (isEscrowEvent) {
    const matchingEscrowEvent = EscrowRewardEventsAbi.find(
      (item) => item.name === eventName,
    );
    correctInputsValues = matchingEscrowEvent?.inputs ?? [];
  }

  if (!correctInputsValues || correctInputsValues.length !== inputs.length) {
    return false;
  }

  const valuesMatch = inputs.every((item, index) => {
    const correctInput = correctInputsValues[index];
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

export const decodeProgramEventLogs = (
  data: EventRequestBody,
  eventName: string,
): ProgramDecodedLogs | null => {
  if (eventName === "ObjectiveCompleted") {
    const decodedObjEvent = Moralis.Streams.parsedLogs<ObjectiveCompleteEvent>(
      data as any,
    );

    if (!decodedObjEvent || !decodedObjEvent[0]) return null;

    return {
      user: decodedObjEvent[0].user,
      objectiveIndex: Number(decodedObjEvent[0].objectiveIndex),
      authority: decodedObjEvent[0].authority,
      completedAt: new Date(Number(decodedObjEvent[0].completedAt)),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }

  if (eventName === "PointsUpdate") {
    const decodedEvent = Moralis.Streams.parsedLogs<PointsUpdateEvent>(
      data as any,
    );

    if (!decodedEvent || !decodedEvent[0]) return null;

    return {
      user: decodedEvent[0].user,
      total: decodedEvent[0].total,
      amount: decodedEvent[0].amount,
      updatedAt: new Date(Number(decodedEvent[0].updatedAt)),
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
  if (eventName === "ERC20Rewarded") {
    const decodedERC20Event = Moralis.Streams.parsedLogs<ERC20RewardedEvent>(
      data as any,
    );
    if (!decodedERC20Event || !decodedERC20Event[0]) return null;
    return {
      user: decodedERC20Event[0].user,
      amount: decodedERC20Event[0].amount,
      rewardCondition: decodedERC20Event[0].rewardCondition,
      rewardedAt: new Date(Number(decodedERC20Event[0].rewardedAt)),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }

  if (eventName === "ERC721TokenRewarded") {
    const decodedERC721Event = Moralis.Streams.parsedLogs<ERC721RewardedEvent>(
      data as any,
    );
    if (!decodedERC721Event || !decodedERC721Event[0]) return null;

    return {
      user: decodedERC721Event[0].user,
      token: decodedERC721Event[0].token,
      rewardedAt: new Date(Number(decodedERC721Event[0].rewardedAt)),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }

  if (eventName === "ERC1155Rewarded") {
    //TODO
    return null;
  }

  return null;
};

export const addContractAddressToStream = async (
  loyaltyAddresses: string[],
): Promise<boolean> => {
  try {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
    }
    const response = await Moralis.Streams.addAddress({
      id: process.env.MORALIS_STREAM_ID_ONE ?? "",
      address: loyaltyAddresses,
    });

    if (response && response.result) return true;

    return false;
  } catch (error) {
    return false;
  }
};
