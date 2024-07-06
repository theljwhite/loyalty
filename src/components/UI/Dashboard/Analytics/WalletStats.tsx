import { useRouter } from "next/router";
import { api } from "~/utils/api";

interface WalletStatsCardProps {
  title: string;
  description: string;
  stat: string | number;
}

const WalletsStatCard: React.FC<WalletStatsCardProps> = ({
  title,
  description,
  stat,
}): JSX.Element => (
  <div className="relative flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6">
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-md font-semibold leading-6">{title}</p>
        </div>
        <p className="mb-4 text-xs font-normal leading-[1.125rem] text-dashboard-lightGray">
          {description}
        </p>
        <p className="text-xl font-semibold leading-7">{stat}</p>
      </div>
    </div>
  </div>
);

export default function WalletStats() {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data: counts } = api.wallet.getWalletsCount.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );

  return (
    <div className="flex items-stretch gap-3">
      <WalletsStatCard
        title="Total Wallets"
        description="Number of wallets that have been generated"
        stat={counts?.totalCount ?? "0"}
      />
      <WalletsStatCard
        title="Total Assigned Wallets"
        description="Number of wallets representing users"
        stat={counts?.assignedCount ?? "0"}
      />
    </div>
  );
}
