import React from "react";
import Image from "next/image";
import {
  CommonChainERC20Balance,
  WalletERC20,
} from "~/customHooks/useTokenBalances/types";
import { useTokenBalancesStore } from "~/customHooks/useTokenBalances/store";
import { DataTableSpinner } from "../../Misc/Spinners";
import { FormErrorIcon } from "../Icons";
import { formatTokenSymbol } from "~/helpers/balancesFormatting";

export default function CommonERC20Balances() {
  const {
    commonChainERC20Balances,
    commonChainBalanceLoading,
    commonChainBalanceError,
  } = useTokenBalancesStore((state) => state);

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
      {commonChainERC20Balances.map(
        (item: CommonChainERC20Balance, index: number) => {
          return (
            <div key={index} className="mt-4 whitespace-nowrap leading-[1.8]">
              <div>
                <span className="text-lg uppercase text-blue-400">
                  {item.chainName}
                </span>
                <section className="relative mt-2 flex w-full flex-col">
                  {item.balance.length == 0 ? (
                    <div className="flex-rows flex w-full text-start text-white">
                      <span className="pr-3" />
                      <span>No owned tokens found for {item.chainName}</span>
                    </div>
                  ) : (
                    item.balance.map((item: WalletERC20) => {
                      return (
                        <div
                          key={item.id}
                          className="flex-rows flex w-full text-start"
                        >
                          <span className="pr-3" />
                          <div className="flex flex-row items-center justify-center gap-2">
                            <span className="h-4 w-4">
                              {item.logo && (
                                <Image
                                  src={item.logo}
                                  width={20}
                                  height={20}
                                  alt="cryptocurrency logo item"
                                />
                              )}
                            </span>
                            <span className="text-md min-w-[170px] text-blue-200">
                              {item.name}
                            </span>
                          </div>
                          <span className="min-w-[120px] text-blue-100">
                            {formatTokenSymbol(item.symbol)}
                          </span>
                          <span className="text-start text-orange-400">
                            {item.amount} {formatTokenSymbol(item.symbol)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </section>
              </div>
            </div>
          );
        },
      )}
    </>
  );
}
