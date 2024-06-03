import React, { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import {
  addContractAddressToStream,
  deleteContractAddressFromStream,
} from "~/utils/contractEventListener";
import { toastSuccess, toastError } from "../../Toast/Toast";
import DashboardContentBox from "../DashboardContentBox";
import DashboardToggleSwitch from "../DashboardToggleSwitch";

//TODO - can maybe retructure the stream/event updates

export default function AggregateAnalytics() {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data: eventsEnabled } =
    api.loyaltyPrograms.getContractEventsStatus.useQuery(
      {
        loyaltyAddress: String(loyaltyAddress),
      },
      { refetchOnWindowFocus: false },
    );
  const { mutate: updateContractEvents } =
    api.loyaltyPrograms.updateContractEventListening.useMutation();

  const { mutate: initAnalyticsSummaryAndEvents } =
    api.analytics.initAnalyticsSummaryAndEvents.useMutation();

  const onToggleSwitch = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const { checked } = e.target;
    setIsChecked(checked);
    setIsDisabled(true);

    let didStreamUpdate = false;

    if (checked) {
      didStreamUpdate = await addContractAddressToStream([
        String(loyaltyAddress),
      ]);
    }

    if (!checked) {
      didStreamUpdate = await deleteContractAddressFromStream([
        String(loyaltyAddress),
      ]);
    }

    if (didStreamUpdate) {
      toastSuccess(`${checked ? "Enabled" : "Disabled"} aggregate analytics`);
      if (checked) {
        initAnalyticsSummaryAndEvents({
          loyaltyAddress: String(loyaltyAddress),
        });
      } else {
        updateContractEvents({
          loyaltyAddress: String(loyaltyAddress),
          isEnabled: checked,
        });
      }
    }

    if (!didStreamUpdate) {
      toastError(
        `Failed to ${
          checked ? "enable" : "disable"
        } aggregate analytics. Try later.`,
      );
      setIsChecked(checked);
    }

    setTimeout(() => {
      setIsDisabled(false);
    }, 8000);
  };

  return (
    <DashboardContentBox
      title="Aggregate User Analytics"
      titleType="Add-on"
      description="Enable aggregate tracking of users interacting with your loyalty program contract. Allows smart contract events to be listened for and for additional data to be stored off-chain for aggregate analytics tracking."
      descriptionTwo="TODO add a better description and more details of aggregate analytics in the future"
      content={
        <DashboardToggleSwitch
          id="aggregate-switch"
          checked={eventsEnabled || isChecked}
          onChange={onToggleSwitch}
          disableCheckbox={isDisabled}
          disableCheckboxTip="Please wait a moment before trying again"
        />
      }
    />
  );
}
