import { type NextPage } from "next";
import { useRouter } from "next/router";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import { api } from "~/utils/api";
import { escrowStateDisplay } from "~/components/UI/Dashboard/DashboardStateStatus";
import DashboardInfoBox from "~/components/UI/Dashboard/DashboardInfoBox";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import DashboardBreadcrumb from "~/components/UI/Dashboard/DashboardBreadcrumb";
import DashboardStateStatus from "~/components/UI/Dashboard/DashboardStateStatus";
import DashboardAnalyticsStatus from "~/components/UI/Dashboard/DashboardAnalyticsStatus";
import DashboardCopyDataBox from "~/components/UI/Dashboard/DashboardCopyDataBox";
import { getBlockExplorerUrl } from "~/helpers/getBlockExplorerUrl";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const Escrow: NextPage = () => {
  const router = useRouter();
  const { address } = router.query;
  const { data: escrowContract, isLoading: escrowDataLoading } =
    api.loyaltyPrograms.getRelatedEscrowContractByAddress.useQuery(
      { loyaltyProgramAddress: String(address) },
      { refetchOnWindowFocus: false },
    );
  const { data: loyaltyDeployInfo, isLoading: loyaltyInfoLeading } =
    api.loyaltyPrograms.getDeploymentInfoByAddress.useQuery(
      { loyaltyAddress: String(address) },
      { refetchOnWindowFocus: false },
    );

  if (escrowDataLoading || loyaltyInfoLeading) return <DashboardPageLoading />;

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
      {(escrowContract?.state === "AwaitingEscrowApprovals" ||
        escrowContract?.state === "AwaitingEscrowSettings") && (
        <DashboardInfoBox
          infoType="warn"
          info={
            escrowStateDisplay.get(escrowContract?.state)?.message ??
            "Your escrow contract needs additional settings before it can begin rewarding users"
          }
          outlink="TODO route for escrow approvals/deposit"
          outlinkText="Manage my settings in Escrow Approvals"
        />
      )}
      {escrowContract && (
        <div className="space-y-8">
          <DashboardCopyDataBox
            title="Your Escrow Contract"
            description={`This is your escrow contract's address, deployed on ${loyaltyDeployInfo?.chain}.`}
            outlink={`${getBlockExplorerUrl(
              loyaltyDeployInfo?.chain ?? "",
            )}address/${String(escrowContract.address)}`}
            outlinkTitle="View contract details"
            copyBoxLabel="Escrow Address"
            dataToCopy={escrowContract.address}
            copySuccessMessage="Copied escrow address"
            containerBg="bg-neutral-2"
          />
          <DashboardStateStatus
            escrowState={escrowContract.state}
            containerBg="bg-white"
          />
          <DashboardAnalyticsStatus containerBg="white" />
        </div>
      )}
    </div>
  );
};

// @ts-ignore
Escrow.getLayout = getDashboardLayout;
export default Escrow;
