import { useState } from "react";
import { useTokenBalances } from "~/customHooks/useTokenBalances/useTokenBalances";
import DashboardDataSelect from "../DashboardDataSelect";
import { allEvmChainsSelectOptions, evmChainImages } from "~/configs/moralis";
import {
  type CommonChainBalanceType,
  type WalletNFT,
} from "~/customHooks/useTokenBalances/types";
import { type EvmChain } from "moralis/common-evm-utils";
import { EthIcon, ERC721Icon, ERC1155Icon } from "../Icons";
import { useTokenBalancesStore } from "~/customHooks/useTokenBalances/store";
import { type CollectionBalance } from "~/customHooks/useTokenBalances/types";
import BalanceLookupBalances from "./BalanceLookupBalances";

//TODO - rate limit/cache Moralis balance calls (here or in useTokenBalances hook)
//the fetching by 2 <select> fields definitely needs rate limited lol.
//Moralis prob has rate limiting themselves but needs to be done from here too with Redis?

const balanceTypeSelections = [
  {
    id: 0,
    title: "ERC20 Balance",
    value: "ERC20" as CommonChainBalanceType,
  },
  {
    id: 1,
    title: "ERC721 Balance",
    value: "ERC721" as CommonChainBalanceType,
  },
  {
    id: 2,
    title: "ERC1155 Balance",
    value: "ERC1155" as CommonChainBalanceType,
  },
];

export default function BalanceLookup() {
  const [activeBalance, setActiveBalance] =
    useState<CommonChainBalanceType>("ERC20");
  const [activeChain, setActiveChain] = useState<string>("Choose a chain");
  const { getERC20BalanceByChain, getNFTsByChain } = useTokenBalances();
  const {
    setBalanceQueryLoading,
    setERC20BalanceQueryReturn,
    setERC721BalanceQueryReturn,
    setERC1155BalanceQueryReturn,
  } = useTokenBalancesStore((state) => state);

  const fetchERC20BalanceByChain = async (
    evmChain: EvmChain,
  ): Promise<void> => {
    setBalanceQueryLoading(true);
    const response = await getERC20BalanceByChain(evmChain);
    if (response) {
      setERC20BalanceQueryReturn(response);
      setBalanceQueryLoading(false);
    }
    if (!response) setBalanceQueryLoading(false);
  };

  const fetchNFTBalanceByChain = async (
    evmChain: EvmChain,
    contractType: string,
  ): Promise<void> => {
    setBalanceQueryLoading(true);
    const response = await getNFTsByChain(evmChain);
    if (response) {
      if (contractType === "ERC721") {
        const formattedERC721Balance = formatNFTBalances(response, "ERC721");
        setERC721BalanceQueryReturn(formattedERC721Balance);
        setBalanceQueryLoading(false);
      }
      if (contractType === "ERC1155") {
        const formattedERC1155Balance = formatNFTBalances(response, "ERC1155");
        setERC1155BalanceQueryReturn(formattedERC1155Balance);
        setBalanceQueryLoading(false);
      }
    }
    if (!response) setBalanceQueryLoading(false);
  };

  const formatNFTBalances = (
    nfts: WalletNFT[],
    contractType: string,
  ): CollectionBalance[] => {
    const groupedTokens: Record<
      string,
      { collectionName: string; tokenIds: string[] }[]
    > = {};

    const nftsByContractType = nfts.filter(
      (nft: WalletNFT) => nft.contractType === contractType,
    );

    for (const nft of nftsByContractType) {
      const { collectionName, tokenId } = nft;
      if (!groupedTokens[collectionName]) {
        groupedTokens[collectionName] = [
          { collectionName, tokenIds: [String(tokenId)] },
        ];
      } else {
        groupedTokens[collectionName]?.push({
          collectionName,
          tokenIds: [String(tokenId)],
        });
      }
    }
    const formattedTokens = Object.entries(groupedTokens).map(
      ([collectionName, tokenDetails]) => ({
        collectionName,
        tokenIds: tokenDetails.map((detail) => detail.tokenIds).flat(),
      }),
    );
    return formattedTokens;
  };

  const onChainSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): Promise<void> => {
    const [selection] = allEvmChainsSelectOptions.filter(
      (option) => option.value === e.target.value,
    );
    if (selection && activeBalance) {
      setActiveChain(selection.title);
      if (activeBalance === "ERC20") {
        await fetchERC20BalanceByChain(selection.evmChain);
      }
      if (activeBalance === "ERC721" || activeBalance === "ERC1155") {
        await fetchNFTBalanceByChain(selection.evmChain, activeBalance);
      }
    }
  };

  const onBalanceTypeSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): Promise<void> => {
    const [balSelection] = balanceTypeSelections.filter(
      (option) => option.value === e.target.value,
    );
    if (balSelection && activeChain && activeChain !== "Choose a chain") {
      setActiveBalance(balSelection.value);
      const [selectedChain] = allEvmChainsSelectOptions.filter(
        (option) => option.title === activeChain,
      );

      if (balSelection.value === "ERC20" && selectedChain) {
        await fetchERC20BalanceByChain(selectedChain.evmChain);
      }
      if (
        (balSelection.value === "ERC721" || balSelection.value === "ERC1155") &&
        selectedChain
      ) {
        await fetchNFTBalanceByChain(
          selectedChain.evmChain,
          balSelection.value,
        );
      }
    }
  };

  return (
    <div className="relative mt-8 flex flex-1 flex-col rounded-2xl bg-neutral-2 py-8 pe-6 ps-6">
      <div className="flex flex-row items-start">
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex w-full justify-between">
              <div className="flex flex-col">
                <p className="text-md font-semibold leading-6">
                  Get Balance By Chain
                </p>
                <div className="flex w-full justify-between">
                  <div className="flex">
                    <span className="mt-2 text-[13px] font-normal leading-[1.125] text-black opacity-65">
                      View your token balances based on a specific chain
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <DashboardDataSelect
                  activeTab={activeChain}
                  onSelectChange={onChainSelect}
                  selectOptions={allEvmChainsSelectOptions}
                  selectDefaultValue={"Choose a chain"}
                  selectImages={evmChainImages}
                />
                <DashboardDataSelect
                  activeTab={activeBalance}
                  onSelectChange={onBalanceTypeSelect}
                  selectOptions={balanceTypeSelections}
                  selectImages={{
                    ERC20: <EthIcon size={18} color="#37367b" />,
                    ERC721: <ERC721Icon size={22} color="#3b0764" />,
                    ERC1155: <ERC1155Icon size={22} color="currentColor" />,
                  }}
                  imageBackgrounds={{
                    ERC20: "bg-eth-teal",
                    ERC721: "bg-orange-300",
                    ERC1155: "bg-pink-200",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 block">
            <div className="min-h-[300px] w-full rounded-md bg-dashboard-codeBox2 text-sm">
              <div className="p-0 outline-none">
                <div className="flex flex-col p-4">
                  <div className="mb-4 flex w-full flex-row items-center justify-between">
                    <p className="font-semibold text-white">
                      {activeChain === "Choose a chain"
                        ? "Your Balances"
                        : `Your ${activeBalance} Balances for ${activeChain}`}
                    </p>
                  </div>
                  {activeChain === "Choose a chain" ? (
                    <div className="my-12 flex flex-col items-center justify-center gap-2 whitespace-nowrap text-center text-white">
                      Select a chain and balance type to view your balance.
                    </div>
                  ) : (
                    <div>
                      {activeBalance === "ERC20" ? (
                        <BalanceLookupBalances contractType="ERC20" />
                      ) : activeBalance === "ERC721" ? (
                        <BalanceLookupBalances contractType="ERC721" />
                      ) : (
                        <BalanceLookupBalances contractType="ERC1155" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
