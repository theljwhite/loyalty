import { allChains } from "~/configs/wagmi";

export const getBlockExplorerUrl = (chainQuery: string): string => {
  const correctChain = allChains.find((chain) => chain.name === chainQuery);
  if (
    correctChain?.blockExplorers?.default ||
    correctChain?.blockExplorers?.etherscan
  ) {
    return (
      correctChain?.blockExplorers.etherscan?.url ??
      correctChain?.blockExplorers.default.url
    );
  }
  return "";
};
