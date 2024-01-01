//TODO - this is a temporary function for testing. will be refactored.
//it is also not styled, only styled with placeholders

import React from "react";
import { useEscrowApprovalsStore } from "~/customHooks/useEscrowApprovals/store";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { useEscrowApprovals } from "~/customHooks/useEscrowApprovals/useEscrowApprovals";

export default function EscrowApprovals() {
  const { deployLoyaltyData } = useDeployLoyaltyStore();
  const { setSenderAddress, setRewardAddress } = useEscrowApprovalsStore();
  const { approveSender, approveRewards, isERC1155Verified, setDepositKey } =
    useEscrowApprovals();

  const onSenderAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    //TODO validate address input
    setSenderAddress(e.target.value);
  };

  const onRewardAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setRewardAddress(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      Temporary for testing and not styled yet
      <div className="mt-8 space-y-10">
        <div className="flex flex-col">
          <span>Depositer address</span>
          <input
            onChange={(e) => onSenderAddressChange(e)}
            placeholder={deployLoyaltyData.creator}
            className="h-10 rounded-md bg-gray-100 pl-2"
          />
          <button
            onClick={approveSender}
            className="mt-10 rounded-3xl bg-violet-800 p-4 text-white"
          >
            Approve sender
          </button>
        </div>

        <div className="flex flex-col">
          <span>Reward address</span>
          <input
            onChange={(e) => onRewardAddressChange(e)}
            placeholder="Your reward contract address"
            className="h-10 rounded-md bg-gray-100 pl-2"
          />
          <button
            onClick={isERC1155Verified}
            className="mt-10 rounded-3xl bg-violet-800 p-4 text-white"
          >
            Approve Rewards
          </button>
        </div>
        <div className="flex flex-col">
          <span>Depositer key</span>
          <input
            //onChange={(e) => editObjectiveTitle(e, item.id)}
            placeholder="Enter deposit key"
            className="h-10 rounded-md bg-gray-100 pl-2"
          />
          <button
            onClick={setDepositKey}
            className="mt-10 rounded-3xl bg-violet-800 p-4 text-white"
          >
            Set deposit key
          </button>
          <button className="mt-10 rounded-3xl bg-green-800 p-4 text-white">
            Test
          </button>
        </div>
      </div>
    </div>
  );
}
