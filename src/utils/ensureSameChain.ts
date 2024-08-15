import { getAccount } from "wagmi/actions";
import { allChains } from "~/configs/wagmi";

export const ensureSameChain = async (
  programChainId: number,
): Promise<string> => {
  const account = getAccount();
  const connectedChainId = (await account.connector?.getChainId()) ?? 0;

  if (connectedChainId === 0 || programChainId === 0) return "Invalid chain";

  if (connectedChainId !== programChainId) {
    const connectedChainName = allChains.find(
      (chain) => chain.id === connectedChainId,
    )?.name;

    const correctChainName = allChains.find(
      (chain) => chain.id === programChainId,
    )?.name;

    return `Must be connected to ${correctChainName} to perform this action. You are currently connected to ${connectedChainName}.`;
  }

  return "";
};

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
