import { getAccount } from "wagmi/actions";

export const ensureSameChainSameCreator = async (
  programChainId: number,
  programCreatorAddress: string,
): Promise<string> => {
  const account = getAccount();

  if (account.address !== programCreatorAddress) {
    return "Please connect to the same account you used to deploy your program.";
  }
  const connectedChainId = (await account.connector?.getChainId()) ?? 0;

  if (connectedChainId === 0 || programChainId === 0) return "Invalid chain";

  if (connectedChainId !== programChainId) {
    return `You are connected to chain ID ${connectedChainId} but your program is deployed on chain ID ${programChainId}`;
  }

  return "";
};
