import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useEscrowContractRead } from "~/customHooks/useEscrowContractRead/useEscrowContractRead";
import { useDepositRewardsStore } from "~/customHooks/useDepositRewards/store";
import WalletStatsCard from "./WalletStatsCard";

export default function ERC20EscrowStats() {
  const [erc20BalanceDisplay, setERC20BalanceDisplay] = useState<
    number | string
  >("");
  const { isSuccess: depositSuccess } = useDepositRewardsStore(
    (state) => state,
  );

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { data } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );
  const activeDepositPeriod =
    data?.loyaltyProgram?.programEnd &&
    data.loyaltyProgram.programEnd < new Date();

  const { getERC20EscrowBalance } = useEscrowContractRead(
    data?.escrow?.address ?? "",
    data?.escrow?.escrowType ?? "ERC1155",
  );

  useEffect(() => {
    fetchEscrowBalance();
  }, [depositSuccess]);

  const fetchEscrowBalance = async (): Promise<void> => {
    const erc20ContractBalance = await getERC20EscrowBalance();
    console.log("e", erc20ContractBalance);
    setERC20BalanceDisplay(erc20ContractBalance);
  };

  return (
    <div className="my-8 flex flex-row items-stretch gap-3">
      <WalletStatsCard
        title="Escrow balance"
        info="ERC20 balance of escrow contract"
        stat={erc20BalanceDisplay}
      />
      <WalletStatsCard
        title={
          activeDepositPeriod ? "Deposit Period" : "Deposit Period (Ended)"
        }
        info={
          activeDepositPeriod
            ? "Deposit period is active until"
            : "Deposit period ENDED on"
        }
        stat={
          `${data?.escrow?.depositEndDate?.toLocaleTimeString()} on ${data?.escrow?.depositEndDate?.toLocaleDateString()}` ??
          ""
        }
      />
    </div>
  );
}
