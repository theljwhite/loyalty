import Moralis from "moralis";

const checkMoralisCore = async (): Promise<void> => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }
};

export const addContractToStream = async (
  loyaltyAddresses: string[],
): Promise<boolean> => {
  const streamId = process.env.MORALIS_STREAM_ID_ONE ?? "";
  try {
    await checkMoralisCore();

    const response = await Moralis.Streams.addAddress({
      id: streamId,
      address: loyaltyAddresses,
    });

    if (response && response.result) return true;

    return false;
  } catch (error) {
    return false;
  }
};
