export type RelayChainName =
  | "Mumbai"
  | "Goerli"
  | "Sepolia"
  | "Ethereum"
  | "Polygon";

export type RelayChain = {
  name: RelayChainName;
  id: number;
  relayerKey?: string;
  relayerSecret?: string;
  isTestChain?: boolean;
};

export const relayChains: RelayChain[] = [
  {
    name: "Mumbai",
    id: 80001,
    relayerKey: process.env.OPEN_ZEPP_MUMBAI_API_KEY,
    relayerSecret: process.env.OPEN_ZEPP_MUMBAI_SECRET_KEY,
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
