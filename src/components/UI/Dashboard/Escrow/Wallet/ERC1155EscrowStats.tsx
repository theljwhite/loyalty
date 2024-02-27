import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useEscrowContractRead } from "~/customHooks/useEscrowContractRead/useEscrowContractRead";
import WalletStatsCard from "./WalletStatsCard";
import { useDepositRewardsStore } from "~/customHooks/useDepositRewards/store";
import DashboardCopyDataBox from "../../DashboardCopyDataBox";

export default function ERC1155EscrowStats() {
  const [tokens, setTokens] = useState<{ id: string; value: string }[]>([]);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { isSuccess } = useDepositRewardsStore((state) => state);

  const { data } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );
  const depositEndDate = data?.escrow?.depositEndDate;

  const { getERC1155EscrowTokenDetails } = useEscrowContractRead(
    data?.escrow?.address ?? "",
    "ERC1155",
  );

  useEffect(() => {
    fetchStatsFromContract();
  }, [isSuccess]);

  const fetchStatsFromContract = async (): Promise<void> => {
    const escrowTokenDetails = await getERC1155EscrowTokenDetails();
    if (escrowTokenDetails) {
      setTokens(escrowTokenDetails.tokens);
    }
  };

  return (
    <>
      <div className="my-8 flex flex-row items-stretch gap-3">
        {tokens.length > 0 && (
          <DashboardCopyDataBox
            title="Escrow Token Balance"
            description="The token ids and amounts that are deposited to your escrow contract"
            copyBoxLabel="Escrow Balance"
            dataToCopy={`Ids: ${tokens
              .map((tkn) => tkn.id)
              .join(",")} Amounts: ${tokens.map((tkn) => tkn.value).join(",")}`}
            copySuccessMessage="Copied all token ids"
            showBorder
            containerBg="bg-white"
          />
        )}
      </div>
      <div className="my-8 flex flex-row items-stretch gap-3">
        <WalletStatsCard
          title="Total Token Ids in Escrow"
          info="Number of token ids deposited to escrow"
          stat={`${tokens.length} total token ids`}
        />
        <WalletStatsCard
          title="Deposit Period"
          info="Deposit period is active until"
          stat={
            `${depositEndDate?.toLocaleTimeString()} on ${depositEndDate?.toLocaleDateString()}` ??
            ""
          }
        />
      </div>
    </>
  );
}
