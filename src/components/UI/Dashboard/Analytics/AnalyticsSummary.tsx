import { useRouter } from "next/router";
import { api } from "~/utils/api";
import StatsVisualizerCard from "./StatsVisualizerCard";
import StatsLineVisualizer from "./StatsLineVisualizer";
import DashboardPageLoading from "../DashboardPageLoading";
import DashboardPageError from "../DashboardPageError";
import { ERC721Icon, EthIcon } from "../Icons";

export default function AnalyticsSummary() {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data: program } =
    api.loyaltyPrograms.getBasicLoyaltyDataByAddress.useQuery(
      {
        contractAddress: String(loyaltyAddress),
      },
      { refetchOnWindowFocus: false },
    );

  const {
    data: summary,
    isLoading,
    isError,
  } = api.analytics.getSummaryByAddress.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );

  if (isLoading) return <DashboardPageLoading />;
  if (isError) return <DashboardPageError />;

  return (
    <>
      <div className="flex items-stretch gap-3">
        <StatsVisualizerCard
          mainStat={String(summary?.totalUniqueUsers) ?? ""}
          description="Unique users"
          percentChange={20}
          dropOptions={["Last 7 days", "Last month", "All time"]}
          dropId="unique-users"
          fullReportPath={`/analytics/${loyaltyAddress}/users`}
        />
        <StatsVisualizerCard
          mainStat={String(summary?.totalObjectivesCompleted) ?? ""}
          description="Total objectives completed"
          percentChange={20}
          dropOptions={["Last 7 days", "Last month", "All time"]}
          dropId="objectives-complete"
          fullReportPath={`/analytics/${loyaltyAddress}/obj`}
        />
      </div>
      <div className="flex items-stretch gap-3">
        <StatsVisualizerCard
          mainStat={String(summary?.dailyAverageUsers) ?? ""}
          description="Daily average users"
        />
        <StatsVisualizerCard
          mainStat={String(summary?.monthlyAverageUsers) ?? ""}
          description="Monthly average users"
        />
        <StatsVisualizerCard
          mainStat={String(summary?.returningUsers) ?? ""}
          description="Returning users"
        />
      </div>
      <h1 className="my-12 truncate text-2xl font-medium tracking-tight">
        Tokens
      </h1>
      <div className="flex items-stretch gap-3">
        {program?.rewardType === "ERC20" && (
          <>
            <StatsLineVisualizer
              mainStat={String(summary?.totalERC20Withdrawn) ?? ""}
              mainStatTitle="ERC20 tokens withdrawn by users"
              percentChange={20}
              icon={<EthIcon size={24} color="currentColor" />}
              dropOptions={["Last 7 days", "Last month", "All time"]}
              dropId="erc20-withdrawn"
              fullReportPath={`/analytics/${loyaltyAddress}/erc20`}
            />
            <StatsLineVisualizer
              mainStat={String(summary?.totalUnclaimedERC20) ?? ""}
              mainStatTitle="Unclaimed ERC20 rewarded to users"
              percentChange={20}
              icon={<EthIcon size={24} color="currentColor" />}
              dropOptions={["Last 7 days", "Last month", "All time"]}
              dropId="unclaimed-erc20"
              fullReportPath={`/analytics/${loyaltyAddress}/erc20`}
            />
          </>
        )}

        {(program?.rewardType === "ERC721" ||
          program?.rewardType === "ERC1155") && (
          <>
            <StatsLineVisualizer
              mainStat={String(summary?.totalTokensWithdrawn) ?? ""}
              mainStatTitle="Total tokens withdrawn by users"
              percentChange={20}
              icon={<ERC721Icon size={24} color="currentColor" />}
              dropOptions={["Last 7 days", "Last month", "All time"]}
              dropId="nft-withdrawn"
              fullReportPath={`/analytics/${loyaltyAddress}/nft`}
            />
            <StatsLineVisualizer
              mainStat={String(summary?.totalUnclaimedTokens) ?? ""}
              mainStatTitle="Unclaimed tokens rewarded to users"
              percentChange={20}
              icon={<ERC721Icon size={24} color="currentColor" />}
              dropOptions={["Last 7 days", "Last month", "All time"]}
              dropId="unclaimed-nfts"
              fullReportPath={`/analytics/${loyaltyAddress}/nft`}
            />
          </>
        )}
      </div>
    </>
  );
}
