import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { toastError, toastSuccess } from "../../Toast/Toast";
import DashboardContentBox from "~/components/UI/Dashboard/DashboardContentBox";
import DashboardToggleSwitch from "~/components/UI/Dashboard/DashboardToggleSwitch";

//TODO - this may need some kind of loading indicator for when a wallet set is generated

export default function WalletSetSettings() {
  const [isWalletSetChecked, setIsWalletSetChecked] = useState<boolean>(false);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data: walletSetId } = api.wallet.getProgramWalletSetId.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );

  const { mutateAsync: createWalletSet } =
    api.wallet.createWalletSet.useMutation();

  const onCheckChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const checked = e.target.checked;
    setIsWalletSetChecked(e.target.checked);
    if (checked) await callCreateWalletSet();
  };

  const callCreateWalletSet = async (): Promise<void> => {
    try {
      const result = await createWalletSet({
        loyaltyAddress: String(loyaltyAddress),
      });
      if (result) {
        toastSuccess("Enabled wallet set for your program");
      }
      if (result === null) {
        toastError("Your program already has a wallet set enabled");
      }
      if (result === undefined) {
        toastError("Failed to enable wallet set. Try later.");
      }
    } catch (error) {
      toastError("Failed wallet set response");
    }
  };

  return (
    <DashboardContentBox
      title="Entity Wallet Set"
      titleType="Add-on"
      description="Enable a wallet set for your loyalty program. This will allow crypto wallets to be generated for non crypto savvy users as they progress through your loyalty program, complete objectives, etc."
      descriptionTwo="The generated wallets will be used to represent and reward your users on their behalf. Once your program has ended, your non crypto savvy users can use the wallets to receive their rewards."
      content={
        <DashboardToggleSwitch
          id="wallet-set"
          checked={isWalletSetChecked || walletSetId ? true : false}
          onChange={onCheckChange}
          disableCheckbox={walletSetId ? true : false}
          disableCheckboxTip="This program already has a wallet set that was generated and can be used."
        />
      }
    />
  );
}
