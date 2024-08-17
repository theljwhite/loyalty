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
import FreezeEscrow from "~/components/UI/Dashboard/Escrow/Overview/FreezeEscrow";
import CancelEscrow from "~/components/UI/Dashboard/Escrow/Overview/CancelEscrow";

//FreezeEscrow may be moved from here
//CancelEscrow may be moved from here

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
        {data?.escrow?.state && (
          <DashboardStateStatus
            escrowState={data?.escrow?.state}
            containerBg="bg-white"
          />
        )}
        {data?.escrow?.state === "InIssuance" && (
          <>
            <FreezeEscrow />
            <CancelEscrow />
          </>
        )}
      </div>
    </>
  );
};

// @ts-ignore
EscrowOverview.getLayout = getDashboardLayout;
export default EscrowOverview;
