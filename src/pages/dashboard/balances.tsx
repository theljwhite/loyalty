import { useEffect } from "react";
import { type NextPage } from "next";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { ROUTE_DOCS_QUICKSTART } from "~/configs/routes";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import { useGetTokenBalances } from "~/customHooks/useGetTokenBalances/useGetTokenBalances";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const Balances: NextPage = () => {
  const { getCommonChainWalletTokens } = useGetTokenBalances();

  useEffect(() => {
    fetchCommonChainTokens();
  }, []);

  const fetchCommonChainTokens = async (): Promise<void> => {
    const response = await getCommonChainWalletTokens(10);
    console.log("response -->", response);
  };

  return (
    <>
      <div className="space-y-8">
        <DashboardHeader
          title="Balances"
          info="View your wallet token balances"
        />
        <DashboardInfoBanner
          infoType="warn"
          info="Before depositing custom ERC20, ERC721, or ERC1155 tokens, first make sure that your rewards contract has been approved for your loyalty program/escrow contract."
          path={ROUTE_DOCS_QUICKSTART}
          pathName="Read about quick approval process"
        />
      </div>
    </>
  );
};

// @ts-ignore
Balances.getLayout = getDashboardLayout;
export default Balances;
