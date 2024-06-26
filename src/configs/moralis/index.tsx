import { EvmChain } from "moralis/common-evm-utils";
import Image from "next/image";

export type AllEvmChainsSelectOption = {
  id: number;
  value: string;
  title: string;
  evmChain: EvmChain;
};

export type EvmChainImage = {
  id: number;
  image: JSX.Element;
};

const EvmChainAmoy = EvmChain.create(80002);

export const manualEvmChains: Record<
  number,
  { name: string; evmChain: EvmChain }
> = {
  80002: { name: "Polygon Amoy", evmChain: EvmChainAmoy },
};

export const moralisEvmChains = {
  Common: [EvmChain.ETHEREUM, EvmChain.POLYGON, EvmChainAmoy],
  Secondary: [
    EvmChain.ARBITRUM,
    EvmChain.AVALANCHE,
    EvmChain.BSC,
    EvmChain.FANTOM,
    EvmChain.SEPOLIA,
    EvmChain.GNOSIS,
    EvmChain.GOERLI,
  ],
};

export const evmChainImages: Record<string, JSX.Element> = {
  "Choose a chain": (
    <Image
      width={20}
      height={20}
      alt="Eth logo"
      src="/utilityImages/chainCircle.png"
    />
  ),
  "Ethereum Mainnet": (
    <Image
      width={20}
      height={20}
      alt="Eth logo"
      src="/chainImages/ethCircle.svg"
    />
  ),
  "Polygon Mainnet": (
    <Image
      width={20}
      height={20}
      alt="Polygon logo"
      src="/chainImages/polygon.svg"
    />
  ),
  Amoy: (
    <Image
      width={20}
      height={20}
      alt="Polygon logo"
      src="/chainImages/polygon.svg"
    />
  ),
  "Arbitrum One": (
    <Image
      width={20}
      height={20}
      alt="Polygon logo"
      src="/chainImages/arbitrum.svg"
    />
  ),
  "Avalanche C-Chain": (
    <Image
      width={20}
      height={20}
      alt="Polygon logo"
      src="/chainImages/avalanche.png"
    />
  ),
  "Fantom Opera": (
    <Image
      width={20}
      height={20}
      alt="Polygon logo"
      src="/chainImages/fantom.svg"
    />
  ),
  Gnosis: (
    <Image
      width={20}
      height={20}
      alt="Polygon logo"
      src="/chainImages/gnosis.png"
    />
  ),
  Sepolia: (
    <Image
      width={20}
      height={20}
      alt="Polygon logo"
      src="/chainImages/ethCircle.svg"
    />
  ),
  Goerli: (
    <Image
      width={20}
      height={20}
      alt="Polygon logo"
      src="/chainImages/ethCircle.svg"
    />
  ),
};

export const allMoralisEvmChains = Object.values(moralisEvmChains).flat();

export const allEvmChainsSelectOptions: AllEvmChainsSelectOption[] =
  allMoralisEvmChains.map((item, index) => ({
    id: index,
    value: item.name ?? item.hex,
    title: item.name ?? item.hex,
    evmChain: item,
  }));

export const evmChainIdsAndNames = allMoralisEvmChains.map((item) => ({
  chainId: Number(item.hex),
  name: item.name ?? manualEvmChains[Number(item.hex)]?.name ?? item.display(),
}));

export const findIfMoralisEvmChain = (
  deployedChainId: number,
): EvmChain | undefined => {
  const deployedEvmChain = allMoralisEvmChains.find(
    (chain) => Number(chain.hex) === deployedChainId,
  );

  if (deployedEvmChain) return deployedEvmChain;
  else return undefined;
};
