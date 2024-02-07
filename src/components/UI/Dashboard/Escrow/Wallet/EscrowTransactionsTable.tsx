import { useState } from "react";
import { useRouter } from "next/router";
import DashboardInput from "../../DashboardInput";
import DepositERC20 from "./DepositERC20";
import DepositERC721 from "./DepositERC721";
import DepositERC1155 from "./DepositERC1155";
import { api } from "~/utils/api";

import { CoinsOne, EthIcon, SortIcon } from "../../Icons";

export default function EscrowTransactionsTable() {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { data: contractsDb } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress) ?? "",
    },
    { refetchOnWindowFocus: false },
  );

  return (
    <>
      <div>
        <div className="flex flex-col">
          <div className="flex justify-between pb-5">
            <div className="flex flex-col justify-center gap-2">
              <div className="break-words">
                <p className="mb-0 text-lg font-semibold text-dashboard-activeTab">
                  Escrow Transctions
                </p>
              </div>
              <div className="break-words">
                <p className="mb-0 text-sm font-normal leading-5 text-dashboard-neutral">
                  View escrow contract&apos;s balances or make a deposit.
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
                  <div className="z-2 absolute left-0 top-0 flex h-8 w-8 items-center justify-center text-[13px]">
                    <EthIcon size={20} color="currentColor" />
                  </div>
                  <DashboardInput
                    stateVar={"string"}
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
                  Depositor
                </th>
                <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                  Type
                </th>
                <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="table-row-group align-middle">
              <tr className="table-row">
                <td
                  colSpan={4}
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
            </tbody>
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

      {/* {isDepositKeyModalOpen && (
      <DashboardSimpleInputModal
        modalTitle="Confirm your ERC20 deposit"
        modalDescription="Enter your deposit key to confirm your deposit"
        inputLabel="Enter Deposit Key"
        inputOnChange={handleAmountChange}
        inputHelpMsg="Deposited tokens will remain locked in escrow until loyalty program has concluded or tokens have been rewarded"
        inputState={depositAmount}
        inputInstruction="Enter your deposit key to confirm that you wish to deposit"
        inputPlaceholder="Your Deposit Key Here"
        inputDisabled={false}
        inputValid={true}
        btnTitle="Confirm deposit"
        btnDisabled={false}
        onActionBtnClick={handleDeposit}
        bannerInfo="Learn more about deposits and how tokens are managed"
        setIsModalOpen={setIsDepositModalOpen}
      />
    )} */}
    </>
  );
}
