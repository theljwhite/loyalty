import { useEffect } from "react";
import { type NextPage } from "next";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { ROUTE_DOCS_QUICKSTART } from "~/configs/routes";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import { useTokenBalances } from "~/customHooks/useTokenBalances/useTokenBalances";
import { EvmChain } from "moralis/common-evm-utils";

//TODO 1/21 - finish this

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const Balances: NextPage = () => {
  const {
    getCommonChainERC20Balance,
    getCommonChainNFTs,
    getNFTsByChain,
    balanceError,
  } = useTokenBalances();

  useEffect(() => {
    // fetchCommonChainTokens();
    // fetchTokenBalanceByChain();
    // fetchCommonChainERC20Tokens();
  }, []);

  const fetchCommonChainTokens = async (): Promise<void> => {
    const response = await getCommonChainNFTs(10);
    console.log("response -->", response);
  };

  const fetchTokenBalanceByChain = async (): Promise<void> => {
    const response = await getNFTsByChain(EvmChain.POLYGON);
    console.log("response by chain -->", response);
  };

  const fetchCommonChainERC20Tokens = async (): Promise<void> => {
    const response = await getCommonChainERC20Balance();
    console.log("erc20 response -->", response);
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
        {balanceError.isError && <div>{balanceError.message}</div>}
      </div>
    </>
  );
};

// @ts-ignore
Balances.getLayout = getDashboardLayout;
export default Balances;
