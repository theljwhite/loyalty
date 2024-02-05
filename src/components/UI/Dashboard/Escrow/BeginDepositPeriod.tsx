import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import DashboardCopyDataBox from "../DashboardCopyDataBox";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";
import DashboardSelectBox from "../DashboardSelectBox";
import DashboardActionButton from "../DashboardActionButton";
import { toastLoading, toastSuccess } from "../../Toast/Toast";
import { DateIcon, ClockIcon, FormErrorIcon } from "../Icons";
import { TWO_HOURS, ONE_WEEK } from "~/constants/timeAndDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//TODO Date Picker styling fixes, needs to extend width of container
//may need to override react-datepicker classes?
//width needs fixed

//TODO - validate that deposit end date doesnt interfere with loyalty program end date...
//...although the escrow contracts have handling for this, maybe do it here too...
//...(they will revert setDepositKey TX if dates are too close together)

//TODO - also try to eliminate the need for a useEffect here in the future.

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
  const [depositError, setDepositError] = useState<string>("");

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { setDepositKey } = useEscrowApprovals();
  const { depositPeriodEndsAt, setDepositPeriodEndsAt, isLoading, isSuccess } =
    useEscrowApprovalsStore((state) => state);

  const { data: escrowDetails, isLoading: escrowLoading } =
    api.loyaltyPrograms.getEscrowApprovalsRelatedData.useQuery(
      { loyaltyAddress: String(loyaltyAddress) },
      { refetchOnWindowFocus: false, enabled: Boolean(loyaltyAddress) },
    );
  const { mutate: updateEscrowDb } = api.escrow.doApprovalsUpdate.useMutation();

  useEffect(() => {
    if (isLoading) {
      setIsModalOpen(false);
    }
    if (isSuccess && escrowDetails) {
      toastSuccess("Deposit key set in contract and deposit period has begun.");
      updateEscrowDb({
        escrowAddress: escrowDetails.escrowAddress,
        isDepositKeySet: true,
        depositEndDate: depositPeriodEndsAt,
      });
    }
  }, [isLoading, isSuccess, setIsModalOpen]);

  const handleBeginDepositPeriod = async (): Promise<void> => {
    if (!depositPeriodEndsAt) {
      setDepositError("Must select a deposit period end date");
      return;
    }
    if (!escrowDetails?.depositKey) {
      setDepositError("Failed to validate deposit key. Try later.");
      return;
    }

    setDepositError("");
    toastLoading("Request sent to wallet.", true);

    if (escrowDetails?.depositKey && escrowDetails?.escrowAddress) {
      await setDepositKey(
        escrowDetails.depositKey,
        escrowDetails.escrowAddress,
      );
    }
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
    setDepositEndDate(date);
    if (depositTime && date) {
      combineTimeAndDate(depositTime, date);
    }
  };

  const onDepositEndTimeChange = (timeDate: Date | null): void => {
    setDepositTime(timeDate);
    if (timeDate && depositEndsDate) {
      combineTimeAndDate(timeDate, depositEndsDate);
    }
  };

  const combineTimeAndDate = (time: Date, date: Date): void => {
    const timeInHours = time.getHours();
    const timeMinutes = time.getMinutes();
    const combinedDate = new Date(date);
    combinedDate.setHours(timeInHours);
    combinedDate.setMinutes(timeMinutes);
    combinedDate.setSeconds(0);
    setDepositPeriodEndsAt(combinedDate);
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
          {depositError && (
            <span className="flex flex-row gap-1 truncate pl-4 font-medium text-error-1">
              <FormErrorIcon size={20} color="currentColor" /> {depositError}
            </span>
          )}
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
          btnDisabled={!depositKeyEntryValid}
          onActionBtnClick={handleBeginDepositPeriod}
          setIsModalOpen={setIsModalOpen}
          bannerInfo="Learn more about Deposit Period."
        />
      )}
    </>
  );
}
