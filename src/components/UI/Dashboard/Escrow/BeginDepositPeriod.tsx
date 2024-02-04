import { useState } from "react";
import { useRouter } from "next/router";
import DashboardCopyDataBox from "../DashboardCopyDataBox";
import DashboardSingleInputBox from "../DashboardSingleInputBox";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";
import DashboardSelectBox from "../DashboardSelectBox";
import { api } from "~/utils/api";

//TODO 2/4 - finish (this is very unfinished)

export default function BeginDepositPeriod() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [depositKeyEntry, setDepositKeyEntry] = useState<string>("");
  const [depositKeyEntryValid, setDepositKeyEntryValid] =
    useState<boolean>(false);
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { data: escrowDetails, isLoading: escrowLoading } =
    api.loyaltyPrograms.getEscrowApprovalsRelatedData.useQuery(
      { loyaltyAddress: String(loyaltyAddress) },
      { refetchOnWindowFocus: false },
    );

  const onBeginDepositPeriodClick = async (): Promise<void> => {
    setIsModalOpen(true);
  };

  const onDepositKeyEntryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    //TODO
    setDepositKeyEntry(e.target.value);
  };

  const onDepositEndDateChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    //TODO
    console.log("changed dep date");
  };

  return (
    <div className="space-y-8">
      <DashboardCopyDataBox
        title="Your Deposit Key"
        description="Your deposit key for depositing tokens into your escrow contract when deposit period is active. When you are ready to begin deposit period, you must first set your key in escrow contract, which begins your deposit period."
        copyBoxLabel="Deposit Key"
        dataToCopy={escrowDetails?.depositKey ?? ""}
        copySuccessMessage="Copied deposit key"
        isSecret
        containerBg="bg-neutral-2"
        dataLoading={escrowLoading}
      />
      {/* <DashboardSelectBox
        title="Deposit Period End Date"
        description="How long do you need to deposit tokens into your escrow contract? Choose an end date."
        selections={selections}
        warning="Action cannot be undone once written to your smart contract"
      /> */}
      <DashboardSingleInputBox
        title="Deposit Key"
        placeholder="Your Deposit Key Here"
        description="Paste your deposit key here to verify that you are ready to begin your escrow contract's deposit period"
        stateVar={depositKeyEntry}
        onChange={onDepositKeyEntryChange}
        disableCondition={false}
        isValid={depositKeyEntryValid}
        isRequiredField
      />

      <div className="w-full">
        <div className="pt-12">
          <div className="ring-gray-950/6 relative isolate space-y-5 px-12 py-40 text-center">
            <div className="space-y-3 "></div>
          </div>
        </div>
      </div>
    </div>
  );
}
