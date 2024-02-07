import { useDepositRewardsStore } from "~/customHooks/useDepositRewards/store";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import { ModalSpinner } from "~/components/UI/Misc/Spinners";
import { InfoIcon } from "../../Icons";
import Link from "next/link";

//TODO unfinished

interface DepositReceiptProps {
  setIsReceiptOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DepositReceipt({
  setIsReceiptOpen,
}: DepositReceiptProps) {
  const { isLoading, isSuccess } = useDepositRewardsStore((state) => state);

  return (
    <DashboardModalWrapper setIsModalOpen={setIsReceiptOpen}>
      <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
        <div className="flex items-center justify-between text-dashboard-activeTab">
          {isLoading ? "Depositing your tokens" : "Deposit Receipt"}
        </div>

        <p className="mt-1 text-sm font-normal leading-5 text-dashboard-lightGray"></p>
      </header>
      <div className="relative mt-6 w-full">
        <div className="flex-1 py-0 pe-6 ps-6">
          <div className="flex flex-col items-center justify-center">
            <ModalSpinner size={40} />

            <span className="text-md mt-2 font-normal leading-5 text-dashboard-lightGray">
              Please wait while your deposit is processed
            </span>
          </div>
        </div>
      </div>
      <footer className="mt-8 flex items-center justify-between py-0 pe-6 ps-6">
        <div className="flex w-full justify-between">
          <div className="mt-2 flex text-sm text-dashboard-neutral">
            <div className="mr-1 mt-px inline-block h-[1em] w-[1em] shrink-0 text-primary-1">
              <InfoIcon size={14} color="currentColor" />
            </div>
            <div className="text-[13px] text-dashboard-lightGray">
              <p>
                Remain idle while transaction completes. Something not right?{" "}
                <Link className="text-primary-1" href="TODO help link">
                  Get help
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </DashboardModalWrapper>
  );
}
