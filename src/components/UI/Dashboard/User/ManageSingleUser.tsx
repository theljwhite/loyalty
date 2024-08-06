import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useContractProgression } from "~/customHooks/useContractProgression";
import { ETHEREUM_ADDRESS_REGEX } from "~/constants/regularExpressions";
import DashboardInput from "../DashboardInput";
import DashboardDataTable from "../DashboardDataTable";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import UserContractStats from "./UserContractStats";
import { UsersIconOne } from "../Icons";

//TODO - rate limit contract calls
//TODO - complete objective input modal to contract

export type ProgressionDisplay = {
  points: number;
  currentTier: string;
  erc20Balance?: string;
  erc721Balance?: number[];
  erc1155Balance?: { tokenId: number; amount: bigint }[];
  rewardsSymbol?: string;
};

type UserObjectiveDisplay = {
  title: string;
  points: number;
  completed: string;
}[];

export default function ManageSingleUser() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchValid, setIsSearchValid] = useState<boolean>(true);
  const [isEditingObjectives, setIsEditingObjectives] =
    useState<boolean>(false);

  const [contractDataLoading, setContractDataLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [userObjectives, setUserObjectives] = useState<UserObjectiveDisplay>(
    [],
  );
  const [progression, setProgression] = useState<ProgressionDisplay>({
    points: 0,
    currentTier: "N/A",
    erc20Balance: "0",
    erc721Balance: [],
    erc1155Balance: [],
  });

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data } = api.loyaltyPrograms.getAllLoyaltyProgramData.useQuery(
    {
      contractAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );
  const { chainId, rewardType, escrowAddress } = data?.loyaltyProgram ?? {};

  const {
    getUserProgression,
    getUserCompletedObjectives,
    getUserRewardsERC20,
    getUserRewardsERC721,
    getUserRewardsERC1155,
  } = useContractProgression(
    String(loyaltyAddress),
    chainId ?? 0,
    escrowAddress ?? "",
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setSearchQuery(value);

    if (!ETHEREUM_ADDRESS_REGEX.test(value) && value.length > 0) {
      setIsSearchValid(false);
    } else setIsSearchValid(true);
  };

  const handleSearchGetContractData = async (): Promise<void> => {
    setError("");
    setContractDataLoading(true);
    try {
      const userProgression = await getUserProgression(searchQuery);

      if (userProgression.points === 0) {
        setUserObjectives([]);
        setProgression({ points: 0, currentTier: "N/A" });
        setContractDataLoading(false);
        setError(
          `Could not find results for ${shortenEthereumAddress(
            searchQuery,
            8,
            8,
          )}`,
        );
        return;
      }

      const userCompletedObjectives =
        await getUserCompletedObjectives(searchQuery);

      const objectivesWithUserCompletion = data?.objectives.map(
        (obj, index) => ({
          title:
            obj.title.length > 32 ? `${obj.title.slice(0, 32)}...` : obj.title,
          points: obj.reward ?? 0,
          completed: userCompletedObjectives[index] ? "Yes" : "No",
        }),
      );

      setUserObjectives(objectivesWithUserCompletion ?? []);

      let erc20Balance, erc721Balance, erc1155Balance, rewardsSymbol;

      if (rewardType === "ERC20") {
        const { amountToDecimals, symbol } =
          await getUserRewardsERC20(searchQuery);
        erc20Balance = amountToDecimals;
        rewardsSymbol = symbol;
      }

      if (rewardType === "ERC721") {
        erc721Balance = await getUserRewardsERC721(searchQuery);
      }

      if (rewardType === "ERC1155") {
        erc1155Balance = await getUserRewardsERC1155(searchQuery);
      }

      const hasPlaceholderTier =
        data?.loyaltyProgram?.tiersActive &&
        data?.tiers[0]?.rewardsRequired !== 0;

      const currentTierName = hasPlaceholderTier
        ? data?.tiers[userProgression.currentTier - 1]?.name
        : data?.tiers[userProgression.currentTier]?.name;

      setContractDataLoading(false);
      setProgression({
        points: userProgression.points,
        currentTier: currentTierName ?? "N/A",
        erc20Balance: erc20Balance,
        erc721Balance: erc721Balance,
        erc1155Balance: erc1155Balance,
        rewardsSymbol: rewardsSymbol,
      });
    } catch (error) {
      setContractDataLoading(false);
      setError(
        `Error fetching results for ${shortenEthereumAddress(
          searchQuery,
          8,
          8,
        )}`,
      );
    }
  };

  return (
    <>
      {isEditingObjectives && (
        <div>TODO input modal to write to contract to complete objectives</div>
      )}
      <div className="flex items-center gap-3">
        <div className="lg:min-w-[580px]">
          <div className="relative">
            <DashboardInput
              stateVar={searchQuery}
              onChange={onSearchChange}
              placeholder="Enter user address"
              disableCondition={false}
              isValid={isSearchValid}
              disableCorrection
            />
          </div>
        </div>
        <div className="flex shrink-0">
          <button
            disabled={!isSearchValid}
            onClick={handleSearchGetContractData}
            className="before:rounded-inherit group relative inline-flex select-none items-center justify-center overflow-hidden rounded bg-[--button-color-bg] px-3 py-1.5 text-base font-medium text-dashboard-body shadow shadow-black/[0.08] outline-none ring-[0.1875rem] ring-transparent ring-offset-[0.0625rem] ring-offset-[--button-color-border] transition transition [--button-color-bg:theme(colors.white)] [--button-color-border:theme(colors.black/0.15)] [--button-color-icon-hover:theme(textColor.primary)] [--button-color-icon:theme(textColor.tertiary)] [--button-color-ring:theme(colors.black/0.08)] [--button-color-text:theme(textColor.primary)] before:absolute before:inset-0 before:bg-[radial-gradient(75%_75%_at_center_top,theme(colors.white/20%),transparent)] before:bg-gradient-to-b before:from-black/0 before:from-50% before:to-black/[0.02] before:transition before:transition-opacity after:transition hover:[--button-color-bg:theme(colors.gray.50)] focus-visible:ring-[--button-color-ring] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-gray-400"
          >
            <span className="inline-flex w-full text-sm">Search</span>
          </button>
        </div>
      </div>
      <UserContractStats
        progression={progression}
        dataLoading={contractDataLoading}
      />
      <section className="flex flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div></div>
        </header>
        <DashboardDataTable
          data={userObjectives}
          dataLoading={contractDataLoading}
          dataError={error}
          columnNames={["Objective name", "Points reward", "User completed"]}
          noDataTitle={
            searchQuery && error ? "No user found" : "No user selected"
          }
          noDataMessage={
            searchQuery && error
              ? error
              : "Get started by entering a user's wallet address"
          }
          noDataIcon={<UsersIconOne color="currentColor" size={34} />}
        />
      </section>
    </>
  );
}
