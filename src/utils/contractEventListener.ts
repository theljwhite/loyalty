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
    nftTokenApprovals: z.any(),
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
  const tempData = data as any;

  if (eventName === "ObjectiveCompleted") {
    const decodedObjEvent =
      Moralis.Streams.parsedLogs<ObjectiveCompleteEvent>(tempData);

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
    const decodedEvent =
      Moralis.Streams.parsedLogs<PointsUpdateEvent>(tempData);

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
  const tempData = data as any;

  if (eventName === "ERC20Rewarded") {
    const decodedERC20Event =
      Moralis.Streams.parsedLogs<ERC20RewardedEvent>(tempData);
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
    const decodedERC721Event =
      Moralis.Streams.parsedLogs<ERC721RewardedEvent>(tempData);
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
    const decodedERC1155Event =
      Moralis.Streams.parsedLogs<ERC1155RewardedEvent>(tempData);

    if (!decodedERC1155Event || !decodedERC1155Event[0]) return null;

    return {
      user: decodedERC1155Event[0].user,
      token: decodedERC1155Event[0].token,
      amount: decodedERC1155Event[0].amount,
      rewardedAt: new Date(Number(decodedERC1155Event[0]?.rewardedAt)),
      contractAddress: data.logs[0]?.address ?? "",
      chainId: Number(data.chainId),
    };
  }

  return null;
};

export const addContractAddressToStream = async (
  loyaltyAddresses: string[],
): Promise<boolean> => {
  //TODO make server side
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
  //TODO make server side
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
