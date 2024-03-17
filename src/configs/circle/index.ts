import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { type Blockchain } from "@circle-fin/developer-controlled-wallets/dist/types/clients/configurations";

type CircleChain = {
  chainId: number;
  chainName: Blockchain;
};

export const circleChains: CircleChain[] = [
  { chainId: 5, chainName: "ETH-GOERLI" },
  { chainId: 11155111, chainName: "ETH-SEPOLIA" },
  { chainId: 1, chainName: "ETH" },
  { chainId: 80001, chainName: "MATIC-MUMBAI" },
  { chainId: 137, chainName: "MATIC" },
  { chainId: 43113, chainName: "AVAX-FUJI" },
  { chainId: 43114, chainName: "AVAX" },
];

export const initiateCircleSdk = (): typeof circleDeveloperSdk => {
  const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY ?? "",
    entitySecret: process.env.CIRCLE_ENTITY_SECRET ?? "",
  });
  return circleDeveloperSdk;
};
