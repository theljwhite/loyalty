import { useState } from "react";
import { useRouter } from "next/router";
import { useContractProgression } from "~/customHooks/useContractProgression";
import { api } from "~/utils/api";
import { type ProgressionDisplay } from "./ManageSingleUser";
import { DashboardLoadingSpinnerTwo } from "../../Misc/Spinners";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";
import { InfoIcon, PointsIconTwo, TiersIconOne, CoinsOne } from "../Icons";

//TODO can clean this up a little
//TODO 8/5 - ERC721 and ERC1155 balance (a better visual display for them)

interface UserContractStatsProps {
  progression: ProgressionDisplay;
  dataLoading: boolean;
}

export default function UserContractStats({
  progression,
  dataLoading,
}: UserContractStatsProps) {
  const [isEditingPoints, setIsEditingPoints] = useState<boolean>(false);
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data } = api.loyaltyPrograms.getAllLoyaltyProgramData.useQuery(
    {
      contractAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );
  const { chainId } = data?.loyaltyProgram ?? {};

  const { givePointsToUser, deductPointsFromUser } = useContractProgression(
    String(loyaltyAddress),
    chainId ?? 0,
  );

  return (
    <>
      {isEditingPoints && (
        <DashboardSimpleInputModal
          modalTitle="Edit points"
          modalDescription="Write to your smart contract to reward or deduct points for a user"
          bannerInfo="This will write to your smart contract directly and require you to pay small gas fees"
          inputLabel="Points amount"
          inputHelpMsg="To deduct points, make the amount a negative number"
          inputInstruction="Add a '-' to make a negative number and deduct points"
          inputOnChange={(e) => console.log("e")}
          inputState="LOL"
          inputDisabled={false}
          inputValid={true}
          inputPlaceholder="Points amount eg: 100"
          btnTitle="Submit"
          btnDisabled={false}
          onActionBtnClick={() => console.log("TODO")}
          setIsModalOpen={setIsEditingPoints}
        />
      )}
      <section className="relative isolate overflow-hidden rounded-lg bg-dashboardLight-body p-1">
        <div className="relative overflow-hidden">
          <header className="grid grid-rows-1 items-center gap-x-6 gap-y-0.5 p-4 ">
            <h2 className="col-start-1 row-start-1 text-balance text-[15px] font-semibold text-dashboardLight-primary">
              User Progression
            </h2>
            <p className="row col-start-1 text-balance text-xs font-normal text-dashboard-lighterText">
              Loyalty program stats from your smart contract for the currently
              selected user
            </p>
          </header>
        </div>
        <div className="shadow-xs mx-1 overflow-hidden rounded-xl border border-dashboard-primary bg-white">
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full table-fixed rounded-xl">
              <colgroup>
                <col className="w-[60%]"></col>
                <col className="w-[40%]"></col>
              </colgroup>
              <thead className="sr-only"></thead>
              <tbody>
                <tr>
                  <td className="flex items-center gap-3 p-4">
                    <button className="absolute inset-0 p-0 outline-none" />
                    <div className="relative -ml-1 text-dashboard-lightGray2">
                      <span className="size-5 shrink-0 overflow-visible stroke-[1.25]">
                        <PointsIconTwo color="currentColor" size={16} />
                      </span>
                    </div>
                    <span className="relative text-sm">User Points</span>
                    <div className="space-x-2" />
                  </td>
                  <td className="relative p-4 text-right">
                    {dataLoading ? (
                      <span>
                        <DashboardLoadingSpinnerTwo size={20} />
                      </span>
                    ) : (
                      <span className="text-dashboard-lightGray2">
                        {progression.points === 0 ? "N/A" : progression.points}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border-t border-dashboard-primary">
                  <td className="flex items-center gap-3 p-4">
                    <button className="absolute inset-0 p-0 outline-none focus:bg-gray-50 focus-visible:ring-0" />
                    <div className="relative -ml-1 text-dashboard-lightGray2">
                      <span className="size-5 shrink-0 overflow-visible stroke-[1.25]">
                        <TiersIconOne color="currentColor" size={16} />
                      </span>
                    </div>
                    <span className="relative text-sm">User Tier</span>
                    <div className="space-x-2" />
                  </td>
                  <td className="relative p-4 text-right">
                    {dataLoading ? (
                      <span>
                        <DashboardLoadingSpinnerTwo size={20} />
                      </span>
                    ) : (
                      <span className="text-dashboard-lightGray2">
                        {progression.currentTier}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border-t border-dashboard-primary">
                  <td className="flex items-center gap-3 p-4">
                    <button className="absolute inset-0 p-0 outline-none focus:bg-gray-50 focus-visible:ring-0" />
                    <div className="relative -ml-1 text-dashboard-lightGray2">
                      <span className="size-5 shrink-0 overflow-visible stroke-[1.25]">
                        <CoinsOne color="currentColor" size={16} />
                      </span>
                    </div>
                    <span className="relative text-sm">
                      User Rewards Balance
                    </span>
                    <div className="space-x-2" />
                  </td>
                  <td className="relative p-4 text-right text-dashboard-lightGray2">
                    {dataLoading ? (
                      <span>
                        <DashboardLoadingSpinnerTwo size={20} />
                      </span>
                    ) : (
                      <div>
                        {!progression.erc20Balance &&
                          !progression.erc721Balance &&
                          !progression.erc1155Balance &&
                          "N/A"}
                        {progression.erc20Balance && (
                          <span>
                            {progression.erc20Balance}{" "}
                            {progression.rewardsSymbol}
                          </span>
                        )}
                        {progression.erc721Balance && (
                          <span className="truncate">
                            {progression.erc721Balance.join(",")}
                          </span>
                        )}
                        {progression.erc1155Balance && (
                          <span className="truncate">
                            {progression.erc1155Balance.map((token, index) => {
                              return (
                                <span key={index}>
                                  {token.tokenId}: {token.amount.toString()}
                                </span>
                              );
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <footer className="overflow-hidden">
          <div className="grid grid-rows-1 items-center gap-6 gap-y-2 p-4 text-dashboard-lightGray2">
            <div className="flex items-center gap-2 text-xs">
              <InfoIcon color="currentColor" size={12} />
              <span>
                Click Current Points to add or reduce the user&apos;s points.
                This will write directly to your smart contract.
              </span>
            </div>
          </div>
        </footer>
      </section>
    </>
  );
}
