import { type NextPage } from "next";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { ROUTE_DOCS_QUICKSTART } from "~/configs/routes";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import CommonBalances from "~/components/UI/Dashboard/Balances/CommonChainBalances";
import BalanceLookup from "~/components/UI/Dashboard/Balances/BalanceLookup";

//TODO - responsiveness styling fixes for all children components

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const Balances: NextPage = () => {
  return (
    <>
      <div className="space-y-8">
        <DashboardHeader
          title="Balances"
          info="View your wallet token balances"
        />
        <DashboardInfoBanner
          infoType="warn"
          info="To deposit tokens into your escrow contract, select your loyalty program and navigate to the Escrow Overview section. Also, first make sure that your desired rewards contract is approved for your program."
          path={ROUTE_DOCS_QUICKSTART}
          pathName="Read about quick approval process"
        />
        <CommonBalances />
        <BalanceLookup />
      </div>
    </>
  );
};

// @ts-ignore
Balances.getLayout = getDashboardLayout;
export default Balances;
