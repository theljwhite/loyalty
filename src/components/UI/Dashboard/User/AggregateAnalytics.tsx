import React, { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import DashboardContentBox from "../DashboardContentBox";
import DashboardToggleSwitch from "../DashboardToggleSwitch";

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

  const onToggleSwitch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked } = e.target;
    setIsChecked(checked);
    setIsDisabled(true);

    updateContractEvents({
      loyaltyAddress: String(loyaltyAddress),
      isEnabled: checked,
    });

    setTimeout(() => {
      setIsDisabled(false);
    }, 5000);
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
        />
      }
    />
  );
}
