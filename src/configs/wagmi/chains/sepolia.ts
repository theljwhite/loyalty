import { Chain } from "@rainbow-me/rainbowkit";

export const sepoliaTestnet: Chain = {
  id: 11155111,
  name: "Sepolia Testnet",
  network: "sepoliaTestnet",
  iconUrl: "/chainImages/ethCircle.svg",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: {
      http: ["https://rpc.sepolia.org"],
    },
    default: {
      http: [`${process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA}`],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Sepolia Etherscan",
      url: "https://sepolia.etherscan.io/",
    },
    default: {
      name: "Sepolia Etherscan",
      url: "https://sepolia.etherscan.io/",
    },
  },
  testnet: true,
};
