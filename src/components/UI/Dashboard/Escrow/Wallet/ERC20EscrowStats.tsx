import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useEscrowContractRead } from "~/customHooks/useEscrowContractRead/useEscrowContractRead";

type StatsCardProps = {
  title: string;
  info: string | number;
  stat: string | number;
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  info,
  stat,
}): JSX.Element => (
  <div className="relative flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6">
    <div className="flex flex-row items-start">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-md mb-0 font-semibold leading-6">{title}</p>
        </div>
        <p className="text-normal mb-4 text-[13px] leading-[1.125] text-dashboard-lightGray">
          {info}
        </p>
        <p className="mb-0 text-sm font-semibold leading-7">{stat}</p>
      </div>
    </div>
  </div>
);

export default function ERC20EscrowStats() {
  const [erc20BalanceDisplay, setERC20BalanceDisplay] = useState<
    number | string
  >("");
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { data } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );

  const { getERC20EscrowBalance } = useEscrowContractRead(
    data?.escrow?.address ?? "",
    data?.escrow?.escrowType ?? "ERC1155",
  );

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (): Promise<void> => {
    //TODO - other quick stats fetching here (number of users, etc);
    const erc20ContractBalance = await getERC20EscrowBalance();
    setERC20BalanceDisplay(erc20ContractBalance);
  };

  return (
    <div className="my-8 flex flex-row items-stretch gap-3">
      <StatsCard
        title="Escrow balance"
        info="Balance of escrow contract"
        stat={erc20BalanceDisplay}
      />
      <StatsCard
        title="Deposit Period"
        info={"Deposit period active until"}
        stat={data?.escrow?.depositEndDate?.toLocaleDateString() ?? ""}
      />
    </div>
  );
}
