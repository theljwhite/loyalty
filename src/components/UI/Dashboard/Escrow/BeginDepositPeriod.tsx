import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import DashboardCopyDataBox from "../DashboardCopyDataBox";
import DashboardSingleInputBox from "../DashboardSingleInputBox";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";
import DashboardSelectBox from "../DashboardSelectBox";
import DashboardActionButton from "../DashboardActionButton";
import { DateIcon, ClockIcon, FormErrorIcon } from "../Icons";
import { TWO_HOURS, ONE_WEEK } from "~/constants/timeAndDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//TODO Date Picker styling fixes, needs to extend width of container
//may need to override react-datepicker classes?
//width needs fixed

//TODO - validate that deposit end date doesnt interfere with loyalty program end date...
//...although the escrow contracts have handling for this...
//...they will revert setDepositKey TX if dates are too close together

//TODO - handle date formatting/selection better

//TODO 2/4 && 2/5 ***** finish this overall

export default function BeginDepositPeriod() {
  const twoHoursFromCurrDateRounded = new Date(
    Math.ceil(Date.now() / TWO_HOURS) * TWO_HOURS,
  );
  const oneWeekFromCurrDate = new Date(Date.now() + ONE_WEEK);
  const nextElevenPm = new Date();
  nextElevenPm.setHours(23, 0, 0, 0);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [depositKeyEntry, setDepositKeyEntry] = useState<string>("");
  const [depositKeyEntryValid, setDepositKeyEntryValid] =
    useState<boolean>(false);
  const [depositEndsDate, setDepositEndDate] = useState<Date | null>(
    new Date(),
  );
  const [depositTime, setDepositTime] = useState<Date | null>(
    twoHoursFromCurrDateRounded,
  );

  const [depositError, setDepositError] = useState<boolean>(false);

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { setDepositKey } = useEscrowApprovals();
  const { depositPeriodEndsAt, setDepositPeriodEndsAt } =
    useEscrowApprovalsStore((state) => state);

  const { data: escrowDetails, isLoading: escrowLoading } =
    api.loyaltyPrograms.getEscrowApprovalsRelatedData.useQuery(
      { loyaltyAddress: String(loyaltyAddress) },
      { refetchOnWindowFocus: false, enabled: Boolean(loyaltyAddress) },
    );

  const handleBeginDepositPeriod = async (): Promise<void> => {
    //TODO finish
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
    if (date) setDepositEndDate(date);
  };

  const onDepositEndTimeChange = (date: Date | null): void => {
    if (date) {
      setDepositTime(date);
    }
  };

  const openBeginDepositModal = (): void => {
    setIsModalOpen(true);
  };

  return (
    <>
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
            <div className="flex flex-col gap-2">
              <div className="relative w-full">
                <label className="mb-2 me-3 block text-start text-sm font-semibold text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
                  Deposit End Date
                </label>
                <div className="mb-2 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                  Select an end date for your deposit period
                </div>
                <div className="flex">
                  <label className="relative flex w-full">
                    <DatePicker
                      className="relative h-8 w-full min-w-[300px] cursor-pointer appearance-none rounded-l-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                      selected={depositEndsDate}
                      onChange={(date) => onDepositEndDateChange(date)}
                      showPreviousMonths={false}
                      minDate={twoHoursFromCurrDateRounded}
                      maxDate={oneWeekFromCurrDate}
                    />
                    <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-r-md bg-primary-1 text-white">
                      <DateIcon size={16} color="currentColor" />
                    </span>
                  </label>
                </div>
              </div>
              <div className="relative mt-6 w-full">
                <label className="mb-2 me-3 block text-start text-sm font-semibold text-dashboard-menuText opacity-100 duration-200 [transition-property:background-color,border-color,color,fill,stroke,opacity,box-shadow,transform]">
                  Deposit End Time
                </label>
                <div className="mb-2 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                  Time of day when deposit period will end
                </div>
                <div className="flex">
                  <label className="relative flex w-full">
                    <DatePicker
                      className="relative h-8 w-full min-w-[300px] cursor-pointer appearance-none rounded-l-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                      selected={depositTime}
                      onChange={(date) => onDepositEndTimeChange(date)}
                      minTime={twoHoursFromCurrDateRounded}
                      maxTime={nextElevenPm}
                      showTimeSelect
                      excludeTimes={[]}
                      showTimeSelectOnly
                      timeCaption="Time"
                      timeIntervals={60}
                      dateFormat="h:mm aa"
                    />
                    <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-r-md bg-primary-1 text-white">
                      <ClockIcon size={16} color="currentColor" />
                    </span>
                  </label>
                </div>
                <div className="mt-4 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                  Chosen end date and time:{" "}
                  <span className="text-primary-1">
                    {depositEndsDate?.toLocaleDateString()}
                  </span>{" "}
                  at{" "}
                  <span className="text-primary-1">
                    {depositTime?.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          }
        />

        <div className="mt-6 flex flex-row items-center">
          {depositError && (
            <span className="flex flex-row gap-1 truncate pl-4 font-medium text-error-1">
              <FormErrorIcon size={20} color="currentColor" /> {depositError}
            </span>
          )}
          <DashboardActionButton
            btnText="Go back"
            linkPath={"/dashboard/programs/TODO/escrow"}
            isPrimary={false}
          />

          <DashboardActionButton
            btnText={
              isConnected && address ? "Begin deposit period" : "Connect wallet"
            }
            btnType="button"
            isPrimary={true}
            onClick={
              isConnected && address ? openBeginDepositModal : openConnectModal
            }
          />
        </div>
      </div>
      {isModalOpen && (
        <DashboardSimpleInputModal
          modalTitle="Begin Deposit Period"
          inputInstruction="Paste your deposit key to confirm deposit period start"
          inputLabel="Enter deposit key"
          inputHelpMsg="You will need to sign one transaction which sets your deposit key in escrow contract and begins your deposit period."
          inputOnChange={onDepositKeyEntryChange}
          inputState={depositKeyEntry}
          inputValid={depositKeyEntryValid}
          inputDisabled={false}
          inputPlaceholder="Your deposit key here"
          btnTitle="Begin deposit period"
          onActionBtnClick={handleBeginDepositPeriod}
          setIsModalOpen={setIsModalOpen}
          bannerInfo="Learn more about Deposit Period."
        />
      )}
    </>
  );
}
