import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useAccount } from "wagmi";
import useDepositRewards from "~/customHooks/useDepositRewards/useDepositRewards";
import useDepositNFTRewards from "~/customHooks/useDepositRewards/useDepositNFTRewards";
import {
  useDepositRewardsStore,
  type TransactionsListItem,
  type TransactionItemType,
} from "~/customHooks/useDepositRewards/store";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import { getElapsedTime } from "~/constants/timeAndDate";
import DashboardInput from "../../DashboardInput";
import DepositERC20 from "./DepositERC20";
import DepositERC721 from "./DepositERC721";
import DepositERC1155 from "./DepositERC1155";
import { EthIcon, SortIcon } from "../../Icons";
import { DashboardLoadingSpinner } from "~/components/UI/Misc/Spinners";

export default function EscrowTransactionsTable() {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { data: contractsDb } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress) ?? "",
    },
    { refetchOnWindowFocus: false },
  );
  const rewardAddress = contractsDb?.escrow?.rewardAddress ?? "";
  const escrowAddress = contractsDb?.escrow?.address ?? "";
  const deployedChainId = contractsDb?.loyaltyProgram?.chainId ?? 0;
  const escrowType = contractsDb?.escrow?.escrowType;

  const { transactionList, txListLoading, isSuccess } = useDepositRewardsStore(
    (state) => state,
  );

  const { fetchAllERC20Transactions } = useDepositRewards(
    rewardAddress,
    escrowAddress,
    deployedChainId,
  );
  const { fetchAllERC721Transactions } = useDepositNFTRewards(
    rewardAddress,
    escrowAddress,
    deployedChainId,
  );

  useEffect(() => {
    if (isConnected && address) {
      fetchTransactionsList();
    }
  }, [isConnected, address, isSuccess]);

  const fetchTransactionsList = async (): Promise<void> => {
    if (escrowType === "ERC20") await fetchAllERC20Transactions();

    if (escrowType === "ERC721") await fetchAllERC721Transactions();

    if (escrowType === "ERC1155") {
      //TODO fetch ERC1155
    }
  };

  const sortByTime = (
    transactions: TransactionsListItem[],
    ascending: boolean,
  ): TransactionsListItem[] => {
    const sortedByTime = transactions.sort((a, b) =>
      ascending
        ? b.time.getTime() - a.time.getTime()
        : a.time.getTime() - b.time.getTime(),
    );
    return sortedByTime;
  };

  const sortByAmount = (
    transactions: TransactionsListItem[],
    ascending: boolean,
    tokenType: string,
  ): TransactionsListItem[] => {
    if (tokenType === "ERC20") {
      //TODO handle possible bigint conversions from string?
      return transactions;
    } else {
      const nftDepositAmountsSorted = transactions.sort((a, b) => {
        const aToNum = Number(a);
        const bToNum = Number(b);
        if (ascending) return bToNum - aToNum;
        else return aToNum - bToNum;
      });
      return nftDepositAmountsSorted;
    }
  };

  const filterByDepositType = (
    transactions: TransactionsListItem[],
    type: TransactionItemType,
  ): TransactionsListItem[] => {
    const filteredByType = transactions.filter((tx) => tx.type === type);
    return filteredByType;
  };

  return (
    <>
      <div>
        <div className="flex flex-col">
          <div className="flex justify-between pb-5">
            <div className="flex flex-col justify-center gap-2">
              <div className="break-words">
                <p className="mb-0 text-lg font-semibold text-dashboard-activeTab">
                  Escrow Transactions
                </p>
              </div>
              <div className="break-words">
                <p className="mb-0 text-sm font-normal leading-5 text-dashboard-neutral">
                  View escrow contract&apos;s transactions or make a deposit
                </p>
              </div>
            </div>
            <div className="ml-auto">
              {escrowType === "ERC20" ? (
                <DepositERC20 />
              ) : escrowType === "ERC721" ? (
                <DepositERC721 />
              ) : (
                escrowType === "ERC1155" && <DepositERC1155 />
              )}
            </div>
          </div>
          <hr className="m-0 me-auto ms-auto block w-full border-dashboard-border1"></hr>
          <div className="flex py-3">
            <div className="flex flex-1">
              <div className="w-full max-w-72">
                <div className="relative isolate flex w-full">
                  <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center text-[13px]">
                    <EthIcon size={20} color="currentColor" />
                  </div>
                  <DashboardInput
                    stateVar={"TODO"}
                    onChange={(e) => console.log("e")}
                    placeholder="Eth address here"
                    disableCondition={false}
                    isValid={true}
                  />
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-lg border border-dashboard-border1 py-4 pe-3 ps-3 align-middle text-sm font-semibold leading-5 text-dashboard-darkGray outline-none"
                >
                  <span className="me-2 inline-flex shrink-0 self-center">
                    <SortIcon size={16} color="currentColor" />
                  </span>
                  Sort
                </button>
                {/* TODO sort dropdown here */}
              </div>
            </div>
          </div>
          <hr className="m-0 border-dashboard-border1"></hr>
        </div>
        <div className="block overflow-x-auto">
          <table className="table w-full border-collapse">
            <thead className="table-header-group align-middle">
              <tr className="table-row overflow-hidden">
                <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                  Type
                </th>
                <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                  Age
                </th>
                <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                  From
                </th>
                <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                  To
                </th>
                <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                  Amount
                </th>
              </tr>
            </thead>
            {isConnected && address ? (
              <tbody className="table-row-group align-middle">
                {txListLoading ? (
                  <tr className="table-row">
                    <td
                      colSpan={5}
                      className="table-cell border-b border-dashboard-border1 py-4 pe-6 ps-6 text-start leading-5 text-dashboard-lightGray"
                    >
                      <div className="flex">
                        <div className="flex w-full justify-center">
                          <span className="text-center text-xs font-normal leading-[1.125rem] text-black opacity-65">
                            <DashboardLoadingSpinner size={40} />
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : transactionList.length == 0 ? (
                  <tr className="table-row">
                    <td
                      colSpan={5}
                      className="table-cell border-b border-dashboard-border1 py-4 pe-6 ps-6 text-start leading-5 text-dashboard-lightGray"
                    >
                      <div className="flex">
                        <div className="flex w-full justify-center">
                          <span className="text-center text-xs font-normal leading-[1.125rem] text-black opacity-65">
                            No transactions to display
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactionList.slice(0, 10).map((tx, index) => {
                    return (
                      <tr key={index} className="table-row">
                        <td className="rounded-y-md whitespace-nowrap py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                          <div className="flex">
                            <div className="flex items-center">
                              <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                {tx.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className=" whitespace-nowrap py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                          <div className="flex">
                            <div className="flex items-center">
                              <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                {getElapsedTime(tx.time, new Date())}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="rounded-y-md whitespace-nowrap py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                          <div className="flex">
                            <div className="flex items-center">
                              <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                {shortenEthereumAddress(tx.from ?? "", 8, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="rounded-y-md whitespace-nowrap py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                          <div className="flex">
                            <div className="flex items-center">
                              <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                {shortenEthereumAddress(tx.to ?? "", 8, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="rounded-y-md whitespace-nowrap py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                          <div className="flex">
                            <div className="flex items-center">
                              <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                {tx.type !== "BATCH_DEPOSIT" &&
                                tx.type !== "DEPOSIT"
                                  ? "N/A"
                                  : tx.amount}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            ) : (
              <tbody className="table-row-group align-middle">
                <tr className="table-row">
                  <td
                    colSpan={5}
                    className="table-cell border-b border-dashboard-border1 py-4 pe-6 ps-6 text-start leading-5 text-dashboard-lightGray"
                  >
                    <div className="flex">
                      <div className="flex w-full justify-center">
                        <span className="text-center text-xs font-normal leading-[1.125rem] text-black opacity-65">
                          Wallet must be connected to fetch transactions
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
        <div className="flex flex-row items-center py-2">
          <div className="flex-1 place-self-stretch" />
          <button className="m-0 me-0 ms-1 p-2 text-[13px] font-normal leading-[1.125rem] text-neutral-3">
            Previous
          </button>
          <button className="m-0 me-0 ms-1 p-2 text-[13px] font-normal leading-[1.125rem] text-neutral-3">
            1
          </button>
          <button className="m-0 me-0 ms-1 p-2 text-[13px] font-normal leading-[1.125rem] text-neutral-3">
            Next
          </button>
        </div>
      </div>
    </>
  );
}
