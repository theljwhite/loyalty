import { useRef } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import StatsAreaVisualizerCard from "./StatsAreaVisualizerCard";
import StatsBarVisualizerCard from "./StatsBarVisualizerCard";
import StatsHorizontalBarVisualizerCard from "./StatsHorizontalBarVisualizerCard";
import DashboardPageError from "../DashboardPageError";
import { DashboardLoadingSpinnerTwo } from "../../Misc/Spinners";

//useRef used here for date so that useQuery doesnt infinite loop
//using a useMutation workaround for now to refetch here. this can be reorganized to use useQuery refetch

export default function AnalyticsSummary() {
  const now = useRef<Date>(new Date());
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data, isLoading, isError } =
    api.analytics.getSummaryAndCharts.useQuery(
      {
        loyaltyAddress: String(loyaltyAddress),
        startDate: null,
        endDate: now.current,
      },
      {
        refetchOnWindowFocus: false,
      },
    );
  const {
    program,
    summary,
    progressionEventCounts,
    objEventCounts,
    userERC20Rewards,
    userERC721Rewards,
    erc1155RewardEventCounts,
    uniqueERC20UserRewards,
  } = data ?? {};

  const progEventCount = progressionEventCounts?.reduce(
    (prev, curr) => prev + curr.count,
    0,
  );
  const progEventInitialData = progressionEventCounts?.map(
    (item) => item.count,
  );
  const progEventInitialXCat = progressionEventCounts?.map((item) => item.date);

  const uniqueUserERC20RewardsSum = uniqueERC20UserRewards?.reduce(
    (prev, curr) => prev + Number(curr.count),
    0,
  );

  if (isError) {
    return (
      <DashboardPageError message="Failed to load analytics summary. Try later." />
    );
  }
  return (
    <>
      <div className="flex items-stretch gap-3">
        <StatsAreaVisualizerCard
          mainStat={String(progEventCount ?? 0)}
          description="Progression events"
          dropOptions={["Last month", "Last 3 months", "Last 6 months"]}
          defaultDropChoice="Last 3 months"
          fullReportPath={`/analytics/${loyaltyAddress}/users`}
          dataLoading={isLoading || !progEventInitialData}
          data={progEventInitialData ?? []}
          xCategories={progEventInitialXCat}
          loyaltyAddress={String(loyaltyAddress)}
          chartType="PROG_EVENTS"
        />

        <StatsBarVisualizerCard
          mainStat={String(summary?.totalObjectivesCompleted) ?? ""}
          description="Total objectives completed"
          dropOptions={["Last month", "Last 3 months", "Last 6 months"]}
          defaultDropChoice="Last 3 months"
          fullReportPath={`/analytics/${loyaltyAddress}/obj`}
          dataLoading={isLoading}
          data={[
            {
              name: "Total objectives completed",
              color: "#5639CC",
              data: objEventCounts ?? [],
            },
          ]}
          loyaltyAddress={String(loyaltyAddress)}
          chartType="TOTAL_OBJ_COMPLETE"
        />
      </div>
      <div className="flex items-stretch gap-3">
        <StatsAreaVisualizerCard
          mainStat={String(summary?.dailyAverageUsers) ?? ""}
          description="Daily average users"
          dataLoading={isLoading}
        />
        <StatsAreaVisualizerCard
          mainStat={String(summary?.monthlyAverageUsers) ?? ""}
          description="Monthly average users"
          dataLoading={isLoading}
        />
        <StatsAreaVisualizerCard
          mainStat={String(summary?.returningUsers) ?? ""}
          description="Returning users"
          dataLoading={isLoading}
        />
      </div>
      <h1 className="my-12 truncate text-2xl font-medium tracking-tight">
        Tokens
      </h1>
      <div>
        {isLoading ? (
          <div className="flex min-h-[175px] w-full items-center justify-center">
            <DashboardLoadingSpinnerTwo size={40} />
          </div>
        ) : (
          <div className="flex items-stretch gap-3">
            {program?.rewardType === "ERC20" ? (
              <>
                <StatsHorizontalBarVisualizerCard
                  title="Total User ERC20 Rewarded"
                  mainStat={summary?.totalUniqueRewarded?.toFixed(4) ?? ""}
                  dropOptions={["Last 3 months", "Last 6 months", "Last year"]}
                  defaultDropChoice="Last 3 months"
                  fullReportPath={`/analytics/${loyaltyAddress}/erc20`}
                  data={userERC20Rewards?.series ?? []}
                  dataLoading={isLoading}
                  xCategories={userERC20Rewards?.xCategories ?? []}
                  chartType="ERC20_REWARD_AND_WITHDRAW"
                  loyaltyAddress={String(loyaltyAddress)}
                />
                <StatsAreaVisualizerCard
                  mainStat={String(uniqueUserERC20RewardsSum)}
                  description="Unique Users Rewarded ERC20"
                  dropOptions={["Last month", "Last 3 months", "Last 6 months"]}
                  defaultDropChoice="Last 3 months"
                  fullReportPath={`/analytics/${loyaltyAddress}/users-erc20`}
                  dataLoading={isLoading || !uniqueERC20UserRewards}
                  data={uniqueERC20UserRewards?.map((item) => item.count)}
                  xCategories={uniqueERC20UserRewards?.map((item) => item.date)}
                  loyaltyAddress={String(loyaltyAddress)}
                  chartType="ERC20_UNIQUE_USERS_REWARDED"
                />
              </>
            ) : program?.rewardType === "ERC721" ? (
              <StatsHorizontalBarVisualizerCard
                title="Total User ERC721 Rewarded"
                mainStat={summary?.totalUniqueRewarded?.toFixed(4) ?? ""}
                dropOptions={["Last 3 months", "Last 6 months", "Last year"]}
                defaultDropChoice="Last 3 months"
                fullReportPath={`/analytics/${loyaltyAddress}/erc721`}
                data={userERC721Rewards?.series ?? []}
                dataLoading={isLoading}
                xCategories={userERC721Rewards?.xCategories ?? []}
                chartType="ERC721_REWARD_AND_WITHDRAW"
                loyaltyAddress={String(loyaltyAddress)}
              />
            ) : (
              // TODO MORE STATS
              program?.rewardType === "ERC1155" && (
                <StatsBarVisualizerCard
                  mainStat={summary?.totalUniqueRewarded?.toFixed(4) ?? ""}
                  description="ERC1155 Token Ids Rewarded"
                  fullReportPath={`/analytics/${loyaltyAddress}/erc1155`}
                  data={[
                    {
                      name: "ERC1155 Token Ids Rewarded",
                      color: "#5639CC",
                      data: erc1155RewardEventCounts ?? [],
                    },
                  ]}
                  dataLoading={isLoading}
                  chartType="ERC1155_REWARD_TOKEN_IDS"
                  loyaltyAddress={String(loyaltyAddress)}
                />
                // TODO MORE STATS
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}
