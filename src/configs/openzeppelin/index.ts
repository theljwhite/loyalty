export type RelayChainName =
  | "Goerli"
  | "Sepolia"
  | "Ethereum"
  | "Polygon"
  | "Amoy";

export type RelayChain = {
  name: RelayChainName;
  id: number;
  relayerKey?: string;
  relayerSecret?: string;
  isTestChain?: boolean;
};

export const relayChains: RelayChain[] = [
  {
    name: "Amoy",
    id: 80002,
    relayerKey: process.env.OPEN_ZEPP_AMOY_API_KEY,
    relayerSecret: process.env.OPEN_ZEPP_AMOY_SECRET_KEY,
    isTestChain: true,
  },
  {
    name: "Goerli",
    id: 5,
    relayerKey: process.env.OPEN_ZEPP_GOERLI_API_KEY,
    relayerSecret: process.env.OPEN_ZEPP_GOERLI_SECRET_KEY,
    isTestChain: true,
  },
  {
    name: "Sepolia",
    id: 11155111,
    relayerKey: process.env.OPEN_ZEPP_SEPOLIA_API_KEY,
    relayerSecret: process.env.OPEN_ZEPP_SEPOLIA_SECRET_KEY,
    isTestChain: true,
  },
  { name: "Ethereum", id: 1 },
  { name: "Polygon", id: 137 },
];
