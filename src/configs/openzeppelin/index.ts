export type RelayChainName = "Mumbai" | "Goerli" | "Ethereum" | "Polygon";

export type RelayChain = {
  name: RelayChainName;
  id: number;
  relayerKey?: string;
  relayerSecret?: string;
};

export const relayChains: RelayChain[] = [
  {
    name: "Mumbai",
    id: 80001,
    relayerKey: process.env.OPEN_ZEPP_MUMBAI_API_KEY,
    relayerSecret: process.env.OPEN_ZEPP_MUMBAI_SECRET_KEY,
  },
  {
    name: "Goerli",
    id: 5,
    relayerKey: process.env.OPEN_ZEPP_GOERLI_API_KEY,
    relayerSecret: process.env.OPEN_ZEPP_GOERLI_SECRET_KEY,
  },
  { name: "Ethereum", id: 1 },
  { name: "Polygon", id: 137 },
];
