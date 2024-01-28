import Image from "next/image";
import { useTokenBalancesStore } from "~/customHooks/useTokenBalances/store";
import { DataTableSpinner } from "../../Misc/Spinners";
import { formatTokenSymbol } from "~/helpers/balancesFormatting";
import { FormErrorIcon } from "../Icons";
import { sortAndAddLineBreaksToNftJSX } from "~/helpers/formatNFTBalJSX";

interface BalanceLookupListProps {
  contractType: string;
}

export default function BalanceLookupBalances({
  contractType,
}: BalanceLookupListProps) {
  const {
    erc20BalanceQueryReturn,
    erc721BalanceQueryReturn,
    erc1155BalanceQueryReturn,
    balanceQueryLoading,
    balanceQueryError,
  } = useTokenBalancesStore((state) => state);

  const nftBalances =
    contractType === "ERC721"
      ? erc721BalanceQueryReturn
      : erc1155BalanceQueryReturn;

  if (balanceQueryLoading) {
    <div className="my-12 flex flex-col items-center justify-center gap-2 whitespace-nowrap text-center text-white">
      <DataTableSpinner size={8} />
    </div>;
  }

  if (balanceQueryError.isError) {
    return (
      <div className="my-12 flex flex-col items-center justify-center gap-2 whitespace-nowrap text-center text-white">
        <FormErrorIcon size={40} color="red" />
        {balanceQueryError.message}
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 whitespace-nowrap leading-[1.8]">
        {contractType === "ERC20" ? (
          <section className="relative mt-2 flex w-full flex-col">
            {erc20BalanceQueryReturn.length == 0 ? (
              <div className="flex-rows flex w-full text-start text-white">
                <span className="pr-3" />
                <span>No owned tokens found for this blockchain</span>
              </div>
            ) : (
              erc20BalanceQueryReturn.map((item) => {
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
        ) : (
          <section className="relative flex w-full flex-col">
            {nftBalances.length == 0 ? (
              <div className="flex-rows flex w-full text-start text-white">
                <span className="pr-3" />
                <span>No owned collections found for this chain</span>
              </div>
            ) : (
              sortAndAddLineBreaksToNftJSX(nftBalances)
            )}
          </section>
        )}
      </div>
    </>
  );
}
