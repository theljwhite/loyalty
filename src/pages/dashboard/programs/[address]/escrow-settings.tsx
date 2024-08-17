import React from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type NextPage } from "next";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import DashboardPageError from "~/components/UI/Dashboard/DashboardPageError";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBox from "~/components/UI/Dashboard/DashboardInfoBox";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import ERC20EscrowSettings from "~/components/UI/Dashboard/Escrow/Settings/ERC20EscrowSettings";
import ERC721EscrowSettings from "~/components/UI/Dashboard/Escrow/Settings/ERC721EscrowSettings";
import ERC1155EscrowSettings from "~/components/UI/Dashboard/Escrow/Settings/ERC1155EscrowSettings";
import FreezeEscrow from "~/components/UI/Dashboard/Escrow/Overview/FreezeEscrow";
import CancelEscrow from "~/components/UI/Dashboard/Escrow/Overview/CancelEscrow";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const EscrowSettings: NextPage = () => {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const {
    data: contractsDb,
    isLoading: contractDbLoading,
    isError: contractsDbErr,
  } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress) ?? "",
    },
    { refetchOnWindowFocus: false },
  );
  const escrowType = contractsDb?.escrow?.escrowType;
  const escrowState = contractsDb?.escrow?.state;
  const inIssuance = escrowState === "InIssuance";

  const depositEndDate = contractsDb?.escrow?.depositEndDate ?? new Date();
  const depositDateNum: number = depositEndDate.getTime();
  const now: number = Math.floor(Date.now());

  if (contractDbLoading) return <DashboardPageLoading />;
  if (contractsDbErr) return <DashboardPageError />;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Escrow Settings"
        info={
          inIssuance
            ? "Settings for your escrow contract"
            : "Customize your escrow rewards settings for your escrow contract"
        }
      />
      {inIssuance ? (
        <>
          <FreezeEscrow />
          <CancelEscrow />
        </>
      ) : (
        <div>
          {now < depositDateNum && (
            <DashboardInfoBox
              infoType="warn"
              info={`Your contract's deposit period is still active until ${depositEndDate.toLocaleTimeString()} on ${depositEndDate.toLocaleDateString()}. Once it is completed, you can customize your escrow settings. Go to Escrow Wallet tab to manage deposits.`}
            />
          )}
          {now > depositDateNum && (
            <div>
              <DashboardInfoBanner
                infoType="warn"
                info="Setting escrow settings will allow you to customize how your escrow contract issues rewards as users progress through your loyalty program. Once escrow settings are set, setting the loyalty program to active will then begin your loyalty program."
              />
              {escrowType === "ERC20" ? (
                <ERC20EscrowSettings />
              ) : escrowType === "ERC721" ? (
                <ERC721EscrowSettings />
              ) : (
                escrowType === "ERC1155" && <ERC1155EscrowSettings />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// @ts-ignore
EscrowSettings.getLayout = getDashboardLayout;
export default EscrowSettings;
