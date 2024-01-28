import React from "react";
import { DataTableSpinner } from "../../Misc/Spinners";
import { FormErrorIcon } from "../Icons";
import { useTokenBalancesStore } from "~/customHooks/useTokenBalances/store";
import { type ChainNFTGroupedByCollection } from "~/customHooks/useTokenBalances/types";
import { sortAndAddLineBreaksToNftJSX } from "~/helpers/formatNFTBalJSX";

interface CommonChainNFTBalanceProps {
  contractType: string;
}

export default function CommonNFTBalances({
  contractType,
}: CommonChainNFTBalanceProps) {
  const {
    commonChainERC721Balances,
    commonChainERC1155Balances,
    commonChainBalanceLoading,
    commonChainBalanceError,
  } = useTokenBalancesStore((state) => state);

  const balances =
    contractType === "ERC721"
      ? commonChainERC721Balances
      : commonChainERC1155Balances;

  if (commonChainBalanceLoading) {
    return (
      <div className="my-12 flex flex-col items-center justify-center gap-2 whitespace-nowrap text-center text-white">
        <DataTableSpinner size={8} />
      </div>
    );
  }

  if (commonChainBalanceError.isError) {
    return (
      <div className="my-12 flex flex-col items-center justify-center gap-2 whitespace-nowrap text-center text-white">
        <FormErrorIcon size={40} color="red" />
        {commonChainBalanceError.message}
      </div>
    );
  }

  return (
    <>
      {balances.map((item: ChainNFTGroupedByCollection, index: number) => (
        <div key={index} className="mt-4 whitespace-nowrap leading-[1.8]">
          <div>
            <span className="text-lg uppercase text-blue-400">
              {item.chainName}
            </span>
            <section className="relative flex w-full flex-col">
              {item.balance.length == 0 ? (
                <div className="flex-rows flex w-full text-start text-white">
                  <span className="pr-3" />
                  <span>No owned collections found for {item.chainName}</span>
                </div>
              ) : (
                sortAndAddLineBreaksToNftJSX(item.balance)
              )}
            </section>
          </div>
        </div>
      ))}
    </>
  );
}
