import { useRouter } from "next/router";
import { useEscrowSettingsStore } from "~/customHooks/useEscrowSettings/store";
import { type EscrowType } from "@prisma/client";
import {
  ERC20RewardCondition,
  ERC721RewardCondition,
  ERC1155RewardCondition,
  ERC721RewardOrder,
} from "~/customHooks/useEscrowSettings/types";
import { api } from "~/utils/api";

interface RewardGoalSelectProps {
  escrowType: EscrowType;
}

//TODO - this is highly unfinished

export default function RewardGoalSelect({
  escrowType,
}: RewardGoalSelectProps) {
  const { rewardGoal, isRewardGoalValid, setRewardGoal, setIsRewardGoalValid } =
    useEscrowSettingsStore((state) => state);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data } = api.loyaltyPrograms.getOnlyObjectivesAndTiers.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );

  return (
    <div className="relative flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6">
      <div className="flex flex-row items-start">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between break-words">
            <p className="text-md font-semibold leading-6">
              Select Reward Goal
            </p>
          </div>
          <p className="mb-4 text-sm font-normal leading-[1.125rem] text-dashboard-lightGray">
            Select a reward goal based on the reward condition in which you have
            applied.
          </p>
          <div className="">
            <div className="my-6 h-px w-full bg-black opacity-15"></div>
            <p className="text-sm font-semibold leading-5">
              Program Objectives
            </p>
            <p className="text-[13px] font-normal leading-[1.125rem] text-dashboard-lightGray">
              Select an objective that will reward a token once completed
            </p>
            <div role="radiogroup">
              {data?.objectives.map((obj) => {
                return (
                  <label key={obj.id} className="mt-4 flex">
                    <input className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap p-0" />
                    <div className="flex items-center">
                      <div className="relative h-4 w-4">
                        <div className="z-1 absolute h-full w-full cursor-pointer" />
                        <label className="relative inline-flex cursor-pointer items-center align-top">
                          <input
                            type="radio"
                            className="absolute -m-px inline-block h-px w-px overflow-hidden whitespace-nowrap p-0"
                          />
                          <span className="relative inline-flex h-4 w-4 shrink-0 justify-center rounded-full border-2 border-primary-1 bg-primary-1 text-white">
                            <span className="relative left-2/4 top-2/4 inline-block h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></span>
                          </span>
                        </label>
                      </div>
                      <p className="ml-2 cursor-pointer text-[13px] font-semibold leading-[1.125rem]">
                        {obj.title}
                      </p>
                    </div>
                  </label>
                );
              })}
              <div></div>
              <label></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
