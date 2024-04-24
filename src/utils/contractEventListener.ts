import { type Authority } from "@prisma/client";
import Moralis from "moralis";
import { z } from "zod";
import LPEventsAbi from "../contractsAndAbis/Events/LPEventsAbi.json";

//TODO - finish add req body shape to schema

export type ObjectiveCompleteEvent = {
  user: string | `0x${string}`;
  objectiveIndex: number;
  authority: Authority;
  completedAt: number;
};

export type PointsUpdateEvent = {
  userAddress: string | `0x${string}`;
  total: number;
  amount: number;
  updatedAt: number;
};

type EventRequestBody = z.infer<typeof eventApiRouteSchema.shape.body>;

export const eventApiRouteSchema = z.object({
  headers: z.object({
    "x-signature": z.string(),
  }),
  body: z.object({
    tag: z.literal("PROGRESS_STREAM_ONE"),
    chainId: z.string(),
    confirmed: z.boolean(),
    block: z.record(z.string(), z.string()),
    txs: z.array(z.any()),
    abis: z.array(z.record(z.string(), z.any())),
    logs: z.array(z.record(z.string(), z.any())),
    streamId: z.string(),
  }),
});

export const objectiveEventAbi = [
  "event ObjectiveCompleted(address indexed user, uint256 objectiveIndex, uint256 completedAt, bytes32 authority",
];

export const pointsUpdateEventAbi = [
  "event PointsUpdate(address indexed user, uint256 total, uint256 amount, uint256 updatedAt",
];

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
  const abiEvents = abis.filter((item) => item.type === "event");

  const relevantAbi = abiEvents.find(
    (event) =>
      event.name === "ObjectiveCompleted" || event.name === "PointsUpdate",
  );
  if (!relevantAbi.name) return "";

  return relevantAbi.name;
};

export const decodeEventLogs = (data: EventRequestBody): void => {
  const eventName = getEventName(data.abis);

  if (eventName === "ObjectiveCompleted") {
    //TODO
  }

  if (eventName === "PointsUpdate") {
    //TODO
  }
};
