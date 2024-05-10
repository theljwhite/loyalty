import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { SPACE_BETWEEN_CAPITALS_REPLACE } from "~/constants/regularExpressions";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import { loyaltyStateDisplay } from "../DashboardStateStatus";
import {
  ROUTE_DASHBOARD_HOME,
  ROUTE_DASHBOARD_CREATE_LP,
} from "~/configs/routes";
import DashboardPageLoading from "../DashboardPageLoading";
import DashboardPageError from "../DashboardPageError";
import { AddIcon, ArrowIcon, FolderIcon } from "../Icons";

export default function FancierProgramsList() {
  const { data: session } = useSession();
  const {
    data: loyaltyPrograms,
    isLoading,
    isError,
  } = api.loyaltyPrograms.getAllProgramsBasicInfo.useQuery(
    {
      creatorId: session?.user.id ?? "",
    },
    { refetchOnWindowFocus: false },
  );

  if (isError)
    return (
      <DashboardPageError message="Loyalty Programs could not be fetched" />
    );

  if (isLoading) return <DashboardPageLoading />;

  return (
    <div className="grid-cols-[repeat(1, _minmax(15rem,_1fr))] mt-9 grid auto-rows-[minmax(14rem,_1fr)] gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <Link
        href={ROUTE_DASHBOARD_CREATE_LP}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-dashboard-border1 bg-dashboardLight-body text-sm text-dashboardLight-secondary outline-none ring-dashboard-border1 hover:border-solid focus-visible:ring-2 focus-visible:ring-2  "
      >
        <AddIcon size={12} color="currentColor" />
        Create Loyalty Program
      </Link>

      {loyaltyPrograms &&
        loyaltyPrograms.map((program) => {
          return (
            <Link
              href={ROUTE_DASHBOARD_HOME(program.address)}
              key={program.id}
              className="group relative isolate flex flex-col rounded-xl bg-dashboardLight-body p-1 pb-0"
            >
              <div className="flex flex-1 flex-col justify-between rounded-lg border border-dashboard-primary bg-white px-4 py-3">
                <div className="absolute inset-x-14 top-1 h-0.5 rounded-b-full bg-primary-1" />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-dashboardLight-secondary">
                    <FolderIcon size={20} color="currentColor" />
                  </span>
                  <div className="truncate text-[11px] text-dashboardLight-secondary">
                    <code>
                      {shortenEthereumAddress(program.address, 20, 16)}
                    </code>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs text-dashboardLight-secondary">
                      {program.rewardType}
                    </span>
                    <h2 className="font-semibold">
                      <span className="line-clamp-3 text-sm tracking-tight text-dashboardLight-primary outline-none">
                        {program.name}
                      </span>
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative isolate inline-flex gap-1 rounded-sm border border-dashed border-dashboard-border1 px-1.5 py-px text-[11px] leading-normal text-dashboardLight-secondary">
                      <span className="size-4 shrink-0 overflow-visible">
                        {loyaltyStateDisplay.get(program.state)?.icon}
                      </span>
                      {SPACE_BETWEEN_CAPITALS_REPLACE(program.state)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between overflow-hidden px-3 py-2 text-xs text-dashboardLight-secondary">
                <span className="transition ease-[cubic-bezier(0.2,0.2,0,1)] group-hover:-translate-x-[calc(100%+theme(spacing.4))] group-has-[a:focus-visible]:-translate-x-[calc(100%+theme(spacing.4))] motion-reduce:duration-0">
                  Updated on {program.updatedAt.toLocaleDateString()},{" "}
                  {program.updatedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-primary flex translate-x-[calc(100%+theme(spacing.4))] items-center gap-1 transition ease-[cubic-bezier(0.2,0.4,0,1)] group-hover:translate-x-0 group-has-[a:focus-visible]:translate-x-0 motion-reduce:duration-0">
                  Go to program
                  <ArrowIcon size={14} color="currentColor" right />
                </span>
              </div>
            </Link>
          );
        })}
    </div>
  );
}
