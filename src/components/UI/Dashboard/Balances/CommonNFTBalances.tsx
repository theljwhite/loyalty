import React from "react";
import { DataTableSpinner } from "../../Misc/Spinners";
import { FormErrorIcon } from "../Icons";
import { useTokenBalancesStore } from "~/customHooks/useTokenBalances/store";
import {
  type ChainNFTGroupedByCollection,
  type CollectionBalance,
} from "~/customHooks/useTokenBalances/types";

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
  } = useTokenBalancesStore();

  const balances =
    contractType === "ERC721"
      ? commonChainERC721Balances
      : commonChainERC1155Balances;

  if (commonChainBalanceLoading) {
    return (
      <div className="my-12 flex flex-col items-center justify-center gap-2 whitespace-nowrap text-center text-white">
        <DataTableSpinner size={40} />
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
            <span className="text-md uppercase text-blue-400">
              {item.chainName}
            </span>
            <section className="relative flex w-full flex-col">
              {item.balance.length == 0 ? (
                <div className="flex-rows flex w-full text-start text-white">
                  <span className="pr-3" />
                  <span>No owned collections found for {item.chainName}</span>
                </div>
              ) : (
                item.balance.map((item: CollectionBalance, index: number) => {
                  const tokens = item.tokenIds
                    .sort((a, b) => Number(a) - Number(b))
                    .map((token: string, tknIndex: number) => (
                      <span key={token} className="text-orange-400">
                        #{token}
                        {tknIndex !== item.tokenIds.length - 1 ? `,${" "}` : ""}
                      </span>
                    ));

                  const groupsOfTenTokens = Array.from(
                    { length: Math.ceil(tokens.length / 10) },
                    (_, i) => tokens.slice(i * 10, (i + 1) * 10),
                  );

                  const tokensWithLineBreaks = groupsOfTenTokens.map(
                    (group, groupIndex) => (
                      <span key={groupIndex}>
                        {group}
                        {groupIndex < groupsOfTenTokens.length - 1 && <br />}
                      </span>
                    ),
                  );
                  return (
                    <div
                      key={index}
                      className="flex-rows flex w-full text-start"
                    >
                      <span className="pr-3" />
                      <span className="text-md text-dashboard-codeLightBlue max-w-[170px]">
                        Collection &quot;{item.collectionName}&quot;:{" "}
                        {tokensWithLineBreaks}
                      </span>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        </div>
      ))}
    </>
  );
}
