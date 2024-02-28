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
import DepositERC20 from "./DepositERC20";
import DepositERC721 from "./DepositERC721";
import DepositERC1155 from "./DepositERC1155";
import { SelectedCheck, SortIcon } from "../../Icons";
import { DashboardLoadingSpinner } from "~/components/UI/Misc/Spinners";

//TODO extra -
//not entirely worried about the sorting/filtering yet until the actual meat and potatoes of this app...
//...is finished. It should work for now, although can def be cleaned up later. Been awhile since I've done one of these lol.
//will also add pagination to the transactions table at a later date.

//also the term "Filter" doesnt really make that much sense here, it should be "SortOrder".
//but works for now. this IS NOT an important feature of the app yet.

type SortBy = "AGE" | "AMOUNT" | "TX_TYPE";
type FilterBy =
  | "Oldest"
  | "Newest"
  | "LargeToLeast"
  | "LeastToLarge"
  | TransactionTypeFilterChoices;

type TransactionTypeFilterChoices = "All" | TransactionItemType;

type SortOption = {
  title: string;
  sortBy: SortBy;
  selected: boolean;
  filterOptionIds: number[];
};

type FilterOption = {
  title: string;
  filterBy: FilterBy;
  selected: boolean;
};

const sortOptionsInitial: SortOption[] = [
  {
    title: "Time/Age",
    sortBy: "AGE",
    selected: true,
    filterOptionIds: [0, 2],
  },
  {
    title: "Amount",
    sortBy: "AMOUNT",
    selected: false,
    filterOptionIds: [2, 4],
  },
  {
    title: "Transaction Type",
    sortBy: "TX_TYPE",
    selected: false,
    filterOptionIds: [4, 8],
  },
];

const filterOptionsInitial: FilterOption[] = [
  { title: "Oldest on top", filterBy: "Oldest", selected: false },
  { title: "Newest on top", filterBy: "Newest", selected: true },
  {
    title: "Largest to least",
    filterBy: "LargeToLeast",
    selected: false,
  },
  {
    title: "Least to largest",
    filterBy: "LeastToLarge",
    selected: false,
  },
  { title: "All Types", filterBy: "All", selected: false },
  { title: "Deposits", filterBy: "DEPOSIT", selected: false },
  { title: "Batch Deposits", filterBy: "BATCH_DEPOSIT", selected: false },
  { title: "Contract Calls", filterBy: "CONTRACT_CALL", selected: false },
];

const tableColumnNames = ["Type", "Age", "From", "To", "Amount"];

export default function EscrowTransactionsTable() {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  const [sortOptions, setSortOptions] =
    useState<SortOption[]>(sortOptionsInitial);
  const [filterOptions, setFilterOptions] =
    useState<FilterOption[]>(filterOptionsInitial);
  const [activeFilter, setActiveFilter] = useState<number[]>([0, 2]);

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

  const { transactionList, txListLoading, isSuccess, setTransactionList } =
    useDepositRewardsStore((state) => state);

  const { fetchAllERC20Transactions } = useDepositRewards(
    rewardAddress,
    escrowAddress,
    deployedChainId,
  );
  const { fetchAllNftTransactions } = useDepositNFTRewards(
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

    if (escrowType === "ERC721" || escrowType === "ERC1155") {
      await fetchAllNftTransactions();
    }
  };

  const applySortAndFilters = (sortBy: SortBy, filterBy: FilterBy): void => {
    const transactionsCopy = [...transactionList];
    let updatedTransactions = [...transactionsCopy];
    if (sortBy === "AGE") {
      const isAscending = filterBy === "Newest" ? true : false;
      updatedTransactions = sortByTime(transactionsCopy, isAscending);
    }

    if (sortBy === "AMOUNT") {
      const isAscending = filterBy === "LeastToLarge" ? true : false;
      updatedTransactions = sortByAmount(transactionsCopy, isAscending);
    }

    if (sortBy === "TX_TYPE") {
      //TODO - later
    }
    setTransactionList(updatedTransactions);
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
  ): TransactionsListItem[] => {
    //TODO extra - handle possible bigint conversions from string?
    const amountsSorted = transactions.sort((a, b) =>
      ascending
        ? Number(a.amount) - Number(b.amount)
        : Number(b.amount) - Number(a.amount),
    );
    return amountsSorted;
  };

  const selectSort = (sortBy: SortBy): void => {
    const [selectedSort] = sortOptions.filter(
      (option) => option.sortBy === sortBy,
    );
    const sortSelection = sortOptions.map((option) =>
      option.sortBy === sortBy
        ? { ...option, selected: true }
        : { ...option, selected: false },
    );
    if (selectedSort) {
      setSortOptions(sortSelection);
      setActiveFilter(selectedSort?.filterOptionIds);

      const selectDefaultFilterOption = filterOptions.map((option, index) => ({
        ...option,
        selected: index === selectedSort.filterOptionIds[0],
      }));
      const [filterOption] = selectDefaultFilterOption.filter(
        (option) => option.selected,
      );

      if (filterOption) {
        setFilterOptions(selectDefaultFilterOption);
        applySortAndFilters(sortBy, filterOption?.filterBy);
      }
    }
  };

  const selectFilter = (filterBy: FilterBy): void => {
    const filterSelection = filterOptions.map((option) =>
      option.filterBy === filterBy
        ? { ...option, selected: true }
        : { ...option, selected: false },
    );
    const [sortSelection] = sortOptions.filter((option) => option.selected);

    if (filterSelection && sortSelection) {
      setFilterOptions(filterSelection);
      applySortAndFilters(sortSelection?.sortBy, filterBy);
    }
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
                  <div className="flex h-8 w-8 items-center justify-center text-[13px]">
                    <SortIcon size={18} color="currentColor" />
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="mb-0 text-sm font-normal leading-5 text-dashboard-neutral">
                      Showing most recent of{" "}
                      <span className="text-primary-1">
                        {transactionList.length}
                      </span>{" "}
                      transactions
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative ml-auto flex gap-2">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-lg border border-dashboard-border1 py-4 pe-3 ps-3 align-middle text-sm font-semibold leading-5 text-dashboard-darkGray outline-none"
                >
                  <span className="me-2 inline-flex shrink-0 self-center">
                    <SortIcon size={16} color="currentColor" />
                  </span>
                  Sort
                </button>
                <div
                  className={`${
                    isSortDropdownOpen ? "visible" : "invisible"
                  } absolute right-0 top-10 min-w-max`}
                >
                  <div
                    className={`${
                      isSortDropdownOpen
                        ? "visible opacity-100"
                        : "invisible opacity-0"
                    } min-w-56 rounded-lg border border-dashboard-border1 bg-white outline-none [box-shadow:0px_24px_48px_rgba(0,_0,_0,_0.16)]`}
                  >
                    <div>
                      <div>
                        <p className="me-4 ms-4 py-3 pe-4 ps-4 text-sm font-semibold leading-3 text-dashboard-darkGray">
                          Sort by
                        </p>
                        {sortOptions.map((option, index) => {
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectSort(option.sortBy)}
                              className="flex w-full items-center bg-white py-[2px] pe-4 ps-4 text-start text-sm font-medium text-dashboard-lightGray outline-none hover:bg-neutral-2"
                            >
                              <span
                                className={`${
                                  option.selected ? "opacity-100" : "opacity-0"
                                } me-3 inline-flex shrink-0 items-center justify-center text-[0.8em]`}
                              >
                                <span className="inline-block h-5 w-5 text-primary-1">
                                  <SelectedCheck
                                    size={20}
                                    color="currentColor"
                                  />
                                </span>
                              </span>
                              <span className="flex-1">
                                <p className="flex py-2 capitalize">
                                  {option.title}
                                </p>
                              </span>
                            </button>
                          );
                        })}
                        <hr className="mt-4 w-full border-solid border-[0px_0px_1px] border-dashboard-divider opacity-60" />
                      </div>
                    </div>
                    <div className="pb-1">
                      <p className="me-4 ms-4 py-3 pe-4 ps-4 text-sm font-semibold leading-3 text-dashboard-darkGray">
                        Sort Order
                      </p>
                      {filterOptions
                        .slice(activeFilter[0], activeFilter[1])
                        .map((option, index) => {
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectFilter(option.filterBy)}
                              className="flex w-full items-center bg-white py-[2px] pe-4 ps-4 text-start text-sm font-medium text-dashboard-lightGray outline-none"
                            >
                              <span
                                className={`${
                                  option.selected ? "opacity-100" : "opacity-0"
                                } me-3 inline-flex shrink-0 items-center justify-center text-[0.8em]`}
                              >
                                <span className="inline-block h-5 w-5 text-primary-1">
                                  <SelectedCheck
                                    size={20}
                                    color="currentColor"
                                  />
                                </span>
                              </span>
                              <span className="flex-1">
                                <p className="flex py-2 capitalize">
                                  {option.title}
                                </p>
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="m-0 border-dashboard-border1"></hr>
        </div>
        <div className="block overflow-x-auto">
          <table className="table w-full border-collapse">
            <thead className="table-header-group align-middle">
              <tr className="table-row overflow-hidden">
                {tableColumnNames.map((name, index) => {
                  return (
                    <th
                      key={index}
                      className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4"
                    >
                      {name}
                    </th>
                  );
                })}
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
