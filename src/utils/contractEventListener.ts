import { type Authority } from "@prisma/client";
import Moralis from "moralis";
import { z } from "zod";
import LPEventsAbi from "../contractsAndAbis/Events/LPEventsAbi.json";

export type ContractEventType = "ObjectiveCompleted" | "PointsUpdate";
export type ObjectiveCompleteEvent = {
  user: string | `0x${string}`;
  objectiveIndex: number;
  authority: Authority;
  completedAt: Date;
};
export type PointsUpdateEvent = {
  user: string | `0x${string}`;
  total: number;
  amount: number;
  updatedAt: Date;
};
export type DecodedLogsReturn = {
  contractAddress: string | `0x${string}`;
  chainId: number;
} & (ObjectiveCompleteEvent | PointsUpdateEvent);

type EventRequestBody = z.infer<typeof eventApiRouteSchema.shape.body>;
type EventRequestInputs = z.infer<typeof eventReqBodyInputsShape>;

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
    name: z.literal("ObjectiveCompleted").or(z.literal("PointsUpdate")),
    type: z.literal("event"),
    anonymous: z.boolean(),
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
  event: ContractEventType,
  inputs: any[],
): boolean => {
  const parsedInputTypes = eventReqBodyInputsShape.safeParse(inputs);

  if (!parsedInputTypes.success) return false;

  let correctInputsValues: EventRequestInputs = [];

  if (event === "ObjectiveCompleted") {
    correctInputsValues = LPEventsAbi[0]?.inputs ?? [];
  }

  if (event === "PointsUpdate") {
    correctInputsValues = LPEventsAbi[1]?.inputs ?? [];
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

export const getEventName = (abis: any[]): string => {
  const relevantAbi = abis
    .filter((item) => item.type === "event")
    .find(
      (event) =>
        event.name === "ObjectiveCompleted" || event.name === "PointsUpdate",
    );

  if (!relevantAbi.name) return "";

  return relevantAbi.name;
};

export const decodeEventLogs = (
  data: EventRequestBody,
): DecodedLogsReturn | null => {
  const eventName = getEventName(data.abi);

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
