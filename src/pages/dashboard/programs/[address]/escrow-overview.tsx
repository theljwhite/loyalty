import { type NextPage } from "next";
import { useRouter } from "next/router";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import { api } from "~/utils/api";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import DashboardPageError from "~/components/UI/Dashboard/DashboardPageError";
import DashboardStateStatus from "~/components/UI/Dashboard/DashboardStateStatus";
import DashboardCopyDataBox from "~/components/UI/Dashboard/DashboardCopyDataBox";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const EscrowOverview: NextPage = () => {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data, isLoading, isError } =
    api.escrow.getAllByLoyaltyAddress.useQuery(
      {
        loyaltyAddress: String(loyaltyAddress),
      },
      { refetchOnWindowFocus: false },
    );

  if (isLoading) return <DashboardPageLoading />;
  if (isError) return <DashboardPageError />;

  return (
    <>
      <div className="space-y-8">
        <DashboardHeader
          title="Escrow Overview"
          info="Basic overview and management of your escrow contract."
        />

        <DashboardCopyDataBox
          title="Escrow Address"
          description="The address of your escrow smart contract"
          copyBoxLabel="Escrow address"
          dataToCopy={data?.escrow?.address ?? ""}
          copySuccessMessage="Copied escrow address"
          containerBg="bg-neutral-2"
          isSecret={false}
        />
        <DashboardCopyDataBox
          title="Reward contract address"
          description="The address of rewards contract"
          copyBoxLabel="Rewards address"
          dataToCopy={data?.escrow?.rewardAddress ?? ""}
          copySuccessMessage="Copied rewards address"
          containerBg="bg-neutral-2"
          isSecret={false}
        />
        <DashboardStateStatus
          escrowState={data?.escrow?.state}
          containerBg="bg-white"
        />
      </div>
    </>
  );
};

// @ts-ignore
EscrowOverview.getLayout = getDashboardLayout;
export default EscrowOverview;
