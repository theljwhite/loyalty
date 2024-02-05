import { useState, useEffect } from "react";
import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import BeginDepositPeriod from "~/components/UI/Dashboard/Escrow/BeginDepositPeriod";

const EscrowWallet: NextPage = () => {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Escrow Wallet"
        info="Manage deposits and balances in your escrow contract"
      />
      {isClient && <BeginDepositPeriod />}
    </div>
  );
};

// @ts-ignore
EscrowWallet.getLayout = getDashboardLayout;
export default EscrowWallet;
