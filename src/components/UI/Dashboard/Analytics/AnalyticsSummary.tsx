import { useRef } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import StatsAreaVisualizerCard from "./StatsAreaVisualizerCard";
import StatsBarVisualizerCard from "./StatsBarVisualizerCard";
import DashboardPageError from "../DashboardPageError";
import { ERC721Icon, EthIcon } from "../Icons";

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
  const { program, summary, progressionEventCounts, objEventCounts } =
    data ?? {};

  const progEventCount = progressionEventCounts?.reduce(
    (prev, curr) => prev + curr.count,
    0,
  );
  const progEventInitialData = progressionEventCounts?.map(
    (item) => item.count,
  );
  const progEventInitialXCat = progressionEventCounts?.map((item) => item.date);

  if (isError) return <DashboardPageError />;
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
      <div className="flex items-stretch gap-3">
        {program?.rewardType === "ERC20" && (
          <>
            {/* TODO total erc20 user withdrawn */}
            {/* TODO total erc20 unclaimed */}
          </>
        )}

        {(program?.rewardType === "ERC721" ||
          program?.rewardType === "ERC1155") && (
          <>
            {/* TODO total tokens withdrawn */}
            {/* TODO total tokens unclaimed */}
          </>
        )}
      </div>
    </>
  );
}
