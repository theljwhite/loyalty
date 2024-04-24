import Moralis from "moralis";
import { z } from "zod";

//TODO - finish add req body shape to schema

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
    abis: z.record(z.string(), z.any()),
    logs: z.array(z.record(z.string(), z.any())),
    streamId: z.string(),
  }),
});

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
