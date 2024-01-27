import { type NextPage } from "next";
import { useRouter } from "next/router";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import DashboardInfoBox from "~/components/UI/Dashboard/DashboardInfoBox";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import { api } from "~/utils/api";
import DashboardBreadcrumb from "~/components/UI/Dashboard/DashboardBreadcrumb";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const Escrow: NextPage = () => {
  const router = useRouter();
  const { address } = router.query;
  const { data: escrowContract, isLoading: escrowDataLoading } =
    api.loyaltyPrograms.getRelatedEscrowContractByAddress.useQuery(
      { loyaltyProgramAddress: String(address) },
      { refetchOnWindowFocus: false },
    );

  if (escrowDataLoading) return <DashboardPageLoading />;

  return (
    <div className="space-y-8">
      <div className="relative flex items-center justify-between gap-4">
        <DashboardBreadcrumb firstTitle="Escrow" secondTitle="Overview" />
      </div>
      <div className="relative flex items-center justify-between gap-4">
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex w-full max-w-[80ch] flex-col gap-3">
            <div className="w-full space-y-2">
              <h1 className="truncate text-2xl font-medium tracking-tight text-dashboard-body">
                Escrow Overview
              </h1>
            </div>
          </div>
        </div>
      </div>
      {!escrowContract && (
        <DashboardInfoBox
          infoType="error"
          info="Your escrow contract is not yet deployed."
          outlink="TODO route for creating escrow contract"
          outlinkText="Take me to deploy my escrow contract"
        />
      )}
    </div>
  );
};

// @ts-ignore
Escrow.getLayout = getDashboardLayout;
export default Escrow;
