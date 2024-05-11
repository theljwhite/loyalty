import { useSession } from "next-auth/react";
import { type GetServerSidePropsContext, type GetServerSideProps } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type NextPage } from "next";
import Head from "next/head";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import FancierProgramsList from "~/components/UI/Dashboard/LoyaltyProgram/FancierProgramList";

// import ProgramsList from "~/components/UI/Dashboard/LoyaltyProgram/ProgramsList";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const Dashboard: NextPage = () => {
  const { data: session } = useSession();
  const dashboardTitle = session?.user.name ?? "Programs";

  return (
    <>
      <Head>
        <title>{`Dashboard - ${dashboardTitle}`}</title>
      </Head>
      <DashboardHeader title="Loyalty Programs" />
      <FancierProgramsList />
      {/* <ProgramsList /> */}
    </>
  );
};

// @ts-ignore
Dashboard.getLayout = getDashboardLayout;
export default Dashboard;
