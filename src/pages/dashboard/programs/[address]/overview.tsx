import { type NextPage } from "next";
import Link from "next/link";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import {
  ROUTE_DASHBOARD_API_KEY,
  ROUTE_DASHBOARD_USER_SETTINGS,
  ROUTE_DOCS_MAIN,
} from "~/configs/routes";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import WalletStatsCard from "~/components/UI/Dashboard/Escrow/Wallet/WalletStatsCard";
import StartProgram from "~/components/UI/Dashboard/LoyaltyProgram/StartProgram";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import DashboardPageError from "~/components/UI/Dashboard/DashboardPageError";
import {
  ObjectivesIconOne,
  ShieldIconOne,
  WalletIcon,
} from "~/components/UI/Dashboard/Icons";

interface OverviewCardProps {
  href: string;
  title: string;
  icon: JSX.Element;
}

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const OverviewCard: React.FC<OverviewCardProps> = ({
  href,
  title,
  icon,
}): JSX.Element => (
  <div className="flex w-full justify-center rounded-lg border border-dashboard-border1 bg-white [box-shadow:0px_4px_4px_rgba(0,_0,_0,_0.04)]">
    <Link className="w-full" href={href}>
      <div className="h-28 text-[0.75rem] font-medium leading-[1.125rem] text-[#6C47FF] hover:rounded-lg hover:bg-[rgba(0,0,0,0.04)]">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2">
          <div className="inline-block h-8 w-8 shrink-0 leading-[1em] text-dashboard-border1">
            {icon}
          </div>
          <p className="text-md font-semibold text-black">{title}</p>
        </div>
      </div>
    </Link>
  </div>
);

const Overview: NextPage = () => {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data, isLoading, isError } =
    api.loyaltyPrograms.getBasicLoyaltyDataByAddress.useQuery(
      {
        contractAddress: String(loyaltyAddress),
      },
      { refetchOnWindowFocus: false },
    );
  const programState = data?.state;

  if (isLoading) return <DashboardPageLoading />;
  if (isError) return <DashboardPageError />;

  return (
    <>
      <div className="space-y-8">
        <DashboardHeader
          title="Loyalty Program Overview"
          info={`Basic overview and management of this program, "${data?.name}"`}
        />
        <div className="mt-8 flex gap-3">
          <OverviewCard
            href={ROUTE_DASHBOARD_API_KEY(String(loyaltyAddress))}
            title={`Get an API key to use ${process.env.NEXT_PUBLIC_PROJECT_NAME} API`}
            icon={<ShieldIconOne size={32} color="currentColor" />}
          />
          <OverviewCard
            href={ROUTE_DASHBOARD_USER_SETTINGS(String(loyaltyAddress))}
            title="Create a Wallet Set for your non crypto savvy users"
            icon={<WalletIcon size={32} color="currentColor" />}
          />
          <OverviewCard
            href={ROUTE_DOCS_MAIN}
            title="Read more about using your contracts on your own apps"
            icon={<ObjectivesIconOne size={32} color="currentColor" />}
          />
        </div>
        <div className="flex items-stretch gap-3">
          <WalletStatsCard
            title="TODO stat here"
            info="TODO a stat description here"
            stat={"0"}
          />
          <WalletStatsCard
            title="TODO stat here"
            info="TODO a stat description here"
            stat={"0"}
          />
        </div>
        {programState !== "Active" && (
          <StartProgram loyaltyAddress={String(loyaltyAddress)} />
        )}
      </div>
    </>
  );
};

// @ts-ignore
Overview.getLayout = getDashboardLayout;
export default Overview;
