import { useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useAccount } from "wagmi";
import useDepositRewards from "~/customHooks/useDepositRewards/useDepositRewards";
import { useDepositRewardsStore } from "~/customHooks/useDepositRewards/store";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import { getElapsedTime } from "~/constants/timeAndDate";
import DashboardInput from "../../DashboardInput";
import DepositERC20 from "./DepositERC20";
import DepositERC721 from "./DepositERC721";
import DepositERC1155 from "./DepositERC1155";
import { EthIcon, SortIcon } from "../../Icons";
import { DashboardLoadingSpinner } from "~/components/UI/Misc/Spinners";

export default function EscrowTransactionsTable() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { data: contractsDb } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress) ?? "",
    },
    { refetchOnWindowFocus: false },
  );

  const { transactionList, txListLoading } = useDepositRewardsStore(
    (state) => state,
  );

  const { fetchAllERC20Transactions } = useDepositRewards(
    contractsDb?.escrow?.rewardAddress ?? "",
    contractsDb?.escrow?.address ?? "",
    contractsDb?.loyaltyProgram?.chainId ?? 0,
  );

  useEffect(() => {
    //TODO - refetch on deposit success - wait a bit first so that
    //results are updated?
    if (isConnected && address) {
      fetchTransactions();
    }
  }, [isConnected, address]);

  const fetchTransactions = async (): Promise<void> => {
    await fetchAllERC20Transactions();
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
              {contractsDb?.escrow?.escrowType === "ERC20" ? (
                <DepositERC20 />
              ) : contractsDb?.escrow?.escrowType === "ERC721" ? (
                <DepositERC721 />
              ) : (
                contractsDb?.escrow?.escrowType === "ERC1155" && (
                  <DepositERC1155 />
                )
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
                <button className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-lg border border-dashboard-border1 py-4 pe-3 ps-3 align-middle text-sm font-semibold leading-5 text-dashboard-darkGray outline-none">
                  <span className="me-2 inline-flex shrink-0 self-center">
                    <SortIcon size={16} color="currentColor" />
                  </span>
                  Sort
                </button>
                {/* TODO - drop down menu for sort */}
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
                                {tx.amount}
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
