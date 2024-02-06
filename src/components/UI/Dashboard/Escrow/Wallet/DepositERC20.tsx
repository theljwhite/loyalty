import { useState } from "react";
import DashboardSimpleInputModal from "../../DashboardSimpleInputModal";
import DashboardInput from "../../DashboardInput";
import { CoinsOne, EthIcon, SortIcon } from "../../Icons";

//TODO 2/6 - highly unfinished (just now started this)

export default function DepositERC20() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex justify-between pb-5">
          <div className="flex flex-col justify-center gap-2">
            <div className="break-words">
              <p className="mb-0 text-lg font-semibold text-dashboard-activeTab">
                ERC20 Deposits
              </p>
            </div>
            <div className="break-words">
              <p className="mb-0 text-sm font-normal leading-5 text-dashboard-neutral">
                Manage and view your escrow contract's ERC20 deposits.
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <button className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm font-semibold leading-[1.2] text-white outline-none">
              <span className="me-2 inline-flex shrink-0 self-center">
                <CoinsOne size={16} color="currentColor" />
              </span>
              Deposit ERC20
            </button>
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
              <button className="text-dashboard-darkGray relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-lg border border-dashboard-border1 py-4 pe-3 ps-3 align-middle font-semibold leading-5 outline-none">
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
      <div className="overflow-x-auto">
        <table className="table w-full border-collapse">
          <thead className="table-header-group align-middle">
            <tr className="table-row overflow-hidden">
              <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                Depositor
              </th>
              <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                Hash
              </th>
              <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="table-row-group align-middle">
            <tr className="table-row">
              <td className="table-cell border-b border-dashboard-border1 py-4 pe-6 ps-6 text-start leading-5 text-dashboard-lightGray">
                <div className="flex">
                  <div className="flex w-full justify-center">
                    <span className="text-center text-xs font-normal leading-[1.125rem] text-black opacity-65">
                      No deposits to display
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-row items-center py-2"></div>
    </div>
  );
}
