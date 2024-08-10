import { useState } from "react";
import { useRouter } from "next/router";
import { useContractProgression } from "~/customHooks/useContractProgression";
import { useLoyaltyContractRead } from "~/customHooks/useLoyaltyContractRead/useLoyaltyContractRead";
import { api } from "~/utils/api";
import { NUMBERS_ONLY_POS_OR_NEG } from "~/constants/regularExpressions";
import { type ProgressionDisplay } from "./ManageSingleUser";
import { DashboardLoadingSpinnerTwo } from "../../Misc/Spinners";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";
import { toastLoading, toastSuccess, toastError } from "../../Toast/Toast";
import { InfoIcon, PointsIconTwo, TiersIconOne, CoinsOne } from "../Icons";

//TODO can clean this up a little
//TODO 8/5 - ERC721 and ERC1155 balance (a better visual display for them)
//TODO 8/5 - make a "ghost" btn instead of <tr> to disable,
//buttons responsible for opening modals when no valid user found

interface UserContractStatsProps {
  progression: ProgressionDisplay;
  dataLoading: boolean;
  searchQuery: string;
  setWriteSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UserContractStats({
  progression,
  dataLoading,
  searchQuery,
  setWriteSuccess,
}: UserContractStatsProps) {
  const [isEditingPoints, setIsEditingPoints] = useState<boolean>(false);
  const [pointsValue, setPointsValue] = useState<string>("");
  const [isPointsValid, setIsPointsValid] = useState<boolean>(true);
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
  const { getTotalPointsPossible } = useLoyaltyContractRead(
    String(loyaltyAddress),
  );

  const onPointsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;

    setPointsValue(value);

    if (!NUMBERS_ONLY_POS_OR_NEG.test(value) && value.length > 0) {
      setIsPointsValid(false);
    } else setIsPointsValid(true);
  };

  const handlePointsContractWrite = async (): Promise<void> => {
    setWriteSuccess(false);
    toastLoading("Request sent to wallet.", true);
    const points = Number(pointsValue);

    try {
      const totalPointsPossible = await getTotalPointsPossible();

      if (!totalPointsPossible) {
        toastError("Error reading contract data. Try again later.");
        return;
      }

      if (points >= totalPointsPossible || points === 0) {
        toastError("Points out of range. Try changing the amount.");
        return;
      }

      setIsEditingPoints(false);

      if (points > 0) {
        const txReceipt = await givePointsToUser(searchQuery, points);

        if (!txReceipt) throw new Error();

        toastSuccess(`Gave ${points} points to user.`);
      } else {
        const txReceipt = await deductPointsFromUser(
          searchQuery,
          Math.abs(points),
        );

        if (!txReceipt) throw new Error();

        toastSuccess(`Deducted ${points} points from user.`);
      }
      setWriteSuccess(true);
    } catch (error) {
      toastError("Error writing to contract. Try again later.");
    }
  };

  return (
    <>
      {isEditingPoints && (
        <DashboardSimpleInputModal
          modalTitle="Edit points"
          modalDescription="Write to your smart contract to reward or deduct points for a user"
          bannerInfo="This will write to your smart contract directly and require you to cover minor gas fees."
          inputLabel="Points amount"
          inputHelpMsg="To deduct points, make the amount a negative number."
          inputInstruction="Enter a positive or negative points value to give or deduct points to the selected user"
          inputOnChange={onPointsChange}
          inputState={pointsValue}
          inputDisabled={false}
          inputValid={isPointsValid}
          inputPlaceholder="Points value eg:100 or -100"
          btnTitle="Submit"
          btnDisabled={!isPointsValid || !pointsValue}
          onActionBtnClick={handlePointsContractWrite}
          setIsModalOpen={setIsEditingPoints}
        />
      )}
      <section className="relative overflow-hidden rounded-lg bg-dashboardLight-body p-1">
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
                <tr
                  className={`cursor-pointer hover:bg-gray-50`}
                  onClick={() => setIsEditingPoints(!isEditingPoints)}
                >
                  <td className="flex items-center gap-3 p-4">
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
                <tr className="cursor-pointer border-t border-dashboard-primary hover:bg-gray-50">
                  <td className="flex items-center gap-3 p-4">
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
