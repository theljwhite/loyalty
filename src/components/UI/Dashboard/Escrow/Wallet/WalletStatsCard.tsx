interface StatsCardProps {
  title: string;
  info: string | number;
  stat: string | number;
}

export default function WalletStatsCard({ title, info, stat }: StatsCardProps) {
  return (
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
}
