import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import DashboardCopyDataBox from "../DashboardCopyDataBox";
import DashboardSingleInputBox from "../DashboardSingleInputBox";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";
import DashboardSelectBox from "../DashboardSelectBox";
import { DateIcon, InfoIcon } from "../Icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//TODO Date Picker styling fixes, needs to extend width of container
//may need to override react-datepicker classes?
//width needs fixed

export default function BeginDepositPeriod() {
  const currentDate = new Date().getTime();
  const twoHoursFromCurrDate = new Date(currentDate + 2 * 60 * 60 * 1000);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [depositKeyEntry, setDepositKeyEntry] = useState<string>("");
  const [depositKeyEntryValid, setDepositKeyEntryValid] =
    useState<boolean>(false);
  const [depositEndsAt, setDepositEndsAt] = useState<Date | null>(
    twoHoursFromCurrDate,
  );
  const [depositTime, setDepositTime] = useState<string>("");
  const [currentStepError, setCurrentStepError] = useState<boolean>(false);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { data: escrowDetails, isLoading: escrowLoading } =
    api.loyaltyPrograms.getEscrowApprovalsRelatedData.useQuery(
      { loyaltyAddress: String(loyaltyAddress) },
      { refetchOnWindowFocus: false },
    );

  const onBeginDepositPeriodClick = async (): Promise<void> => {
    //TODO
    setIsModalOpen(true);
  };

  const onDepositKeyEntryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { value } = e.target;
    setDepositKeyEntry(value);
    if (value.length > 0 && value === escrowDetails?.depositKey) {
      setDepositKeyEntryValid(true);
    } else setDepositKeyEntryValid(false);
  };

  const onDepositEndDateChange = (date: Date | null): void => {
    if (date && date >= twoHoursFromCurrDate) {
      setDepositEndsAt(date);
      const time = date.toLocaleTimeString();
      setDepositTime(time);
    }
  };

  const testClass =
    "inline-flex appearance-none items-center justify-center relative whitespace-nowrap align0middle outline-none rounded-md leading-[1.2] h-8 min-w-10 w-full pl-[16px] pr-[10px] py-[10px]";

  return (
    <div className="space-y-8">
      <DashboardCopyDataBox
        title="Your Deposit Key"
        description="Your deposit key for depositing tokens into your escrow contract. You can also view this later in Escrow Settings."
        copyBoxLabel="Deposit Key"
        dataToCopy={escrowDetails?.depositKey ?? ""}
        copySuccessMessage="Copied deposit key"
        isSecret
        containerBg="bg-neutral-2"
        dataLoading={escrowLoading}
      />
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
      <DashboardSelectBox
        title="Deposit Period End Date"
        description="How long do you need to deposit tokens into your escrow contract?"
        warning="Action cannot be undone once written to your smart contract"
        selections={[]}
        isRequiredField
        customSelect={
          <div className="relative w-full">
            <label className="mb-2 me-3 block text-start text-base font-medium text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
              Select Deposit End Date
            </label>
            <div className="mb-2 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
              Must be at least 2 hours from now
            </div>
            <div className="flex">
              <label className="relative flex w-full">
                <DatePicker
                  className="relative h-8 w-full min-w-[300px] cursor-pointer appearance-none rounded-l-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                  selected={depositEndsAt}
                  onChange={(date) => onDepositEndDateChange(date)}
                  showPreviousMonths={false}
                  minDate={twoHoursFromCurrDate}
                  showTimeSelect
                  showTimeInput
                  timeCaption={"time"}
                  timeIntervals={60}
                  timeFormat="HH:mm"
                />
                <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-r-md bg-primary-1 text-white">
                  <DateIcon size={18} color="currentColor" />
                </span>
              </label>
            </div>
            <div className="mt-2 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
              Chosen end date: {depositEndsAt?.toLocaleDateString()} @{" "}
              {depositTime}
            </div>
          </div>
        }
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
