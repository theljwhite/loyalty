import React, { useEffect, useState } from "react";
import { useTokenBalancesStore } from "~/customHooks/useTokenBalances/store";
import DashboardDataSelect from "../DashboardDataSelect";
import {
  type CommonChainNFTReturn,
  useTokenBalances,
} from "~/customHooks/useTokenBalances/useTokenBalances";
import {
  type CommonChainERC20Balance,
  type CommonChainBalanceType,
  type WalletNFT,
  type ChainNFTGroupedByCollection,
} from "~/customHooks/useTokenBalances/types";
import CommonERC20Balances from "./CommonERC20Balances";
import CommonNFTBalances from "./CommonNFTBalances";
import { EthIcon } from "../Icons";

//TODO - the separateByContractTypeAndGroupTokens function seems a little sloppy
//will probably end up refactoring useTokenBalances calls and reformatting the...
//...common chain returns and return the items sorted by chain and then contract type from there
//The reason it isnt is because the calls may be needed in other use cases than just this

//TODO - add rate limiting/caching to Moralis calls (here or useTokenBalances)
//TODO - also this useEffect may not be needed, can possibly fetch onSelectChange
//TODO - some styling fixes for this component and its children

const commonChainSelectOptions = [
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

export default function CommonChainBalances() {
  const [activeTab, setActiveTab] = useState<CommonChainBalanceType>("ERC20");
  const { getCommonChainERC20Balance, getCommonChainNFTs } = useTokenBalances();
  const {
    setCommonChainBalanceLoading,
    setCommonChainERC20Balances,
    setCommonChainERC721Balances,
    setCommonChainERC1155Balances,
  } = useTokenBalancesStore((state) => state);

  useEffect(() => {
    if (activeTab === "ERC20") {
      fetchCommonChainERC20Balances();
    }
    if (activeTab === "ERC721") {
      fetchCommonChainERC721Balances();
    }
    if (activeTab === "ERC1155") {
      fetchCommonChainERC1155Balances();
    }
  }, [activeTab]);

  const fetchCommonChainERC20Balances = async (): Promise<void> => {
    setCommonChainBalanceLoading(true);
    const response = await getCommonChainERC20Balance();
    if (response) {
      const balances: CommonChainERC20Balance[] = Object.entries(response).map(
        ([chainName, balance]) => ({
          chainName,
          balance,
        }),
      );

      if (balances.length > 0) {
        setCommonChainERC20Balances(balances);
        setCommonChainBalanceLoading(false);
      }
    }
    if (!response) setCommonChainBalanceLoading(false);
  };

  const fetchCommonChainERC721Balances = async (): Promise<void> => {
    setCommonChainBalanceLoading(true);
    const response = await getCommonChainNFTs();
    if (response) {
      const erc721ChainBalances: ChainNFTGroupedByCollection[] =
        separateByContractTypeAndGroupTokens(response, "ERC721");
      setCommonChainERC721Balances(erc721ChainBalances);
      setCommonChainBalanceLoading(false);
    }
    if (!response) setCommonChainBalanceLoading(false);
  };

  const fetchCommonChainERC1155Balances = async (): Promise<void> => {
    setCommonChainBalanceLoading(true);
    const response = await getCommonChainNFTs();
    if (response) {
      const erc1155ChainBalances: ChainNFTGroupedByCollection[] =
        separateByContractTypeAndGroupTokens(response, "ERC1155");
      setCommonChainERC1155Balances(erc1155ChainBalances);
      setCommonChainBalanceLoading(false);
    }
    if (!response) setCommonChainBalanceLoading(false);
  };

  const separateByContractTypeAndGroupTokens = (
    response: CommonChainNFTReturn,
    contractType: string,
  ): ChainNFTGroupedByCollection[] => {
    const sortedAndGroupedBalances: ChainNFTGroupedByCollection[] = [];

    //separate NFTs by contractType, either ERC721 or ERC1155
    Object.entries(response).forEach(([chainName, balanceArray]) => {
      const sortedBalance = balanceArray
        .filter((nft: WalletNFT) => nft.contractType === contractType)
        .sort((a: WalletNFT, b: WalletNFT) =>
          a.collectionName.localeCompare(b.collectionName),
        );

      //group tokenIds that belong to the same collection
      const groupedTokens: Record<
        string,
        { collectionName: string; tokenIds: string[]; contractType: string }[]
      > = {};
      sortedBalance.forEach((balance) => {
        const { collectionName, tokenId, contractType } = balance;
        if (!groupedTokens[collectionName]) {
          groupedTokens[collectionName] = [
            { collectionName, tokenIds: [String(tokenId)], contractType },
          ];
        } else {
          groupedTokens![collectionName]!.push({
            collectionName,
            tokenIds: [String(tokenId)],
            contractType,
          });
        }
      });

      sortedAndGroupedBalances.push({
        chainName,
        balance: Object.entries(groupedTokens).map(
          ([collectionName, tokenDetails]) => ({
            collectionName,
            tokenIds: tokenDetails.map((detail) => detail.tokenIds).flat(),
            contractType: tokenDetails![0]!.contractType,
          }),
        ),
      });
    });

    return sortedAndGroupedBalances;
  };

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const [selection] = commonChainSelectOptions.filter(
      (option) => option.value === e.target.value,
    );
    if (selection) setActiveTab(selection.value);
  };

  return (
    <div className="relative mt-8 flex flex-1 flex-col rounded-2xl bg-neutral-2 py-8 pe-6 ps-6">
      <div className="flex flex-row items-start">
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex w-full justify-between">
              <div className="flex flex-col">
                <p className="text-md font-semibold leading-6">
                  Common Chain Balances
                </p>
                <div className="flex w-full justify-between">
                  <div className="flex">
                    <span className="mt-2 text-[13px] font-normal leading-[1.125] text-black opacity-65">
                      View your token balances on common chains
                    </span>
                  </div>
                </div>
              </div>

              <DashboardDataSelect
                onSelectChange={onSelectChange}
                selectOptions={commonChainSelectOptions}
                selectDefaultValue={commonChainSelectOptions[0]?.value}
                selectImage={[<EthIcon size={20} color="currentColor" />]}
              />
            </div>
          </div>

          <div className="mt-3 block">
            <div className="min-h-[300px] w-full rounded-md bg-dashboard-codeBox2 text-sm">
              <div tabIndex={0} className="p-0 outline-none">
                <div className="flex flex-col p-4">
                  <div className="mb-4 flex w-full flex-row items-center justify-between">
                    <p className="font-semibold text-white">
                      {activeTab} Balance
                    </p>
                  </div>
                  {activeTab === "ERC20" ? (
                    <CommonERC20Balances />
                  ) : activeTab === "ERC721" ? (
                    <CommonNFTBalances contractType="ERC721" />
                  ) : (
                    <CommonNFTBalances contractType="ERC1155" />
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
