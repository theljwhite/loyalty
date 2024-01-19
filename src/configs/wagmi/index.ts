import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  coinbaseWallet,
  imTokenWallet,
  metaMaskWallet,
  okxWallet,
  omniWallet,
  rabbyWallet,
  rainbowWallet,
  tahoWallet,
  trustWallet,
  walletConnectWallet,
  phantomWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { configureChains, Chain, createConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { polygonTestnet } from "./chains/polygonMumbai";

export const allChains: Chain[] = [polygonTestnet];

const publicClients = [
  jsonRpcProvider({
    rpc: (chain) => {
      return {
        http: `${chain.rpcUrls.default.http[0]}`,
      };
    },
  }),
];

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  allChains,
  publicClients,
);

const WALLETCONECT_PROJECT_ID = process.env
  .NEXT_PUBLIC_WALLET_CONNECT_ID as string;

const connectors = connectorsForWallets([
  {
    groupName: "Wallets",
    wallets: [
      metaMaskWallet({ chains, projectId: WALLETCONECT_PROJECT_ID }),
      walletConnectWallet({ chains, projectId: WALLETCONECT_PROJECT_ID }),
      rainbowWallet({ chains, projectId: WALLETCONECT_PROJECT_ID }),
      okxWallet({ chains, projectId: WALLETCONECT_PROJECT_ID }),
      tahoWallet({ chains }),
      coinbaseWallet({ chains, appName: "adajloyalty" }),
      argentWallet({ chains, projectId: WALLETCONECT_PROJECT_ID }),
      trustWallet({ chains, projectId: WALLETCONECT_PROJECT_ID }),
      imTokenWallet({ chains, projectId: WALLETCONECT_PROJECT_ID }),
      omniWallet({ chains, projectId: WALLETCONECT_PROJECT_ID }),
      rabbyWallet({ chains }),
      phantomWallet({ chains }),
    ],
  },
]);

export const configForWagmi = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
