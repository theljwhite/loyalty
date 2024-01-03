//TODO - entire file is temporary for testing purposes
//NONE of it is actually styled yet, only placeholder styling

import React, { useState } from "react";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { Authority, RewardType } from "~/customHooks/useDeployLoyalty/types";
import { useDeployLoyalty } from "~/customHooks/useDeployLoyalty/useDeployLoyalty";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.css";
import { useDeployEscrowStore } from "~/customHooks/useDeployEscrow/store";
import { useDeployEscrow } from "~/customHooks/useDeployEscrow/useDeployEscrow";
import EscrowApprovals from "./EscrowApprovals";
import { type EscrowType } from "~/customHooks/useDeployEscrow/store";
import { signIn } from "next-auth/react";

//TODO - make points limit of 10,000? or something else - in a global constant
//     - as well as a MAX_OBJECTIVES_LENGTH global constant
//TODO - validate inputs

type LoyaltyInput = {
  id: number;
  objectiveTitle: string;
  points: number;
  authority: Authority;
};

export default function CreateStepOne() {
  const MAX_OBJECTIVES_LENGTH = 10; //make a global constant
  const [loyaltyInputs, setLoyaltyInputs] = useState<LoyaltyInput[]>(
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      objectiveTitle: "Enter objective name",
      points: (i + 1) * 100,
      authority: "USER",
    })),
  );
  const { deployLoyaltyProgram } = useDeployLoyalty();
  const {
    programEndsAt,
    setObjectives,
    setAuthorities,
    setName,
    setProgramEnd,
    setRewardType,
  } = useDeployLoyaltyStore((state) => state);
  const { setEscrowType } = useDeployEscrowStore();
  const { deployEscrowContract } = useDeployEscrow();

  const changeProgramName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const addNewObjective = (): void => {
    const newObjective = {
      id: loyaltyInputs.length,
      objectiveTitle: "New objective",
      points: 0,
      authority: "USER" as Authority,
    };
    setLoyaltyInputs((prev) => [...prev, newObjective]);
  };

  const removeObjective = (id: number): void => {
    const removed = loyaltyInputs.filter((item) => item.id != id);
    setLoyaltyInputs(removed);
  };

  const editObjectiveTitle = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
  ): void => {
    const changedTitle = loyaltyInputs.map((item) =>
      item.id == id ? { ...item, objectiveTitle: e.target.value } : { ...item },
    );
    setLoyaltyInputs(changedTitle);
  };

  const editPoints = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
  ): void => {
    const changedPoints = loyaltyInputs.map((item) =>
      item.id == id ? { ...item, points: Number(e.target.value) } : { ...item },
    );
    setLoyaltyInputs(changedPoints);
  };

  const selectAuthority = (
    e: React.ChangeEvent<HTMLSelectElement>,
    id: number,
  ): void => {
    const changedAuthority = loyaltyInputs.map((item) =>
      item.id == id
        ? { ...item, authority: e.target.value as Authority }
        : { ...item },
    );
    setLoyaltyInputs(changedAuthority);
  };

  const selectRewardType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    setRewardType(Number(value));

    if (Number(value) != RewardType.Points) {
      const escrowType = RewardType[Number(value)] as EscrowType;
      setEscrowType(escrowType);
    }
  };

  const handleSetProgramEnd = (date: Date | null): void => {
    if (date) setProgramEnd(date);
  };

  const formatLoyaltyInputs = (): void => {
    const formattedObjectivesTitles = loyaltyInputs.map((item) =>
      item.objectiveTitle.substring(0, 29).trim(),
    );
    const rewards = loyaltyInputs.map((item) => item.points);
    const authorities = loyaltyInputs.map((item) => item.authority);
    const mergedObjectives = formattedObjectivesTitles.map((obj, index) => ({
      title: obj,
      reward: rewards[index] ?? 0,
    }));
    setObjectives(mergedObjectives);
    setAuthorities(authorities);
  };

  const handleContractDeploy = (): void => {
    deployLoyaltyProgram();
  };
  return (
    <div className="flex flex-col items-center justify-center space-y-10 px-8 py-10">
      <div className="flex flex-col pt-4">
        <h1 className="font-bold">Loyalty Program Name</h1>
        <div className="py-4">
          <input
            onChange={changeProgramName}
            placeholder="My Loyalty Program"
            className="h-10 w-full rounded-md bg-gray-100 pl-2"
          />
        </div>

        <div className="pt-4">
          {loyaltyInputs.map((item, index) => {
            return (
              <div key={index} className="flex flex-col gap-4 py-4">
                <h3 className="text-center font-semibold text-black">
                  Objective #{index + 1}
                </h3>
                <div className="flex flex-col ">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col">
                      <span>Title</span>
                      <input
                        onChange={(e) => editObjectiveTitle(e, item.id)}
                        placeholder={item.objectiveTitle}
                        className="h-10 rounded-md bg-gray-100 pl-2"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span>Points for objective</span>
                      <input
                        type="number"
                        onChange={(e) => editPoints(e, item.id)}
                        placeholder={`${item.points} points`}
                        className="h-10 rounded-md bg-gray-100 pl-2"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span>Authority (who can mark completed)</span>
                      <select
                        onChange={(e) => selectAuthority(e, item.id)}
                        className="h-10 rounded-md bg-stone-100 pl-2"
                      >
                        <option value="USER">USER</option>
                        <option value="CREATOR">CREATOR</option>
                      </select>
                    </div>
                    <div>
                      <button
                        onClick={() => removeObjective(item.id)}
                        className="h-8 border border-gray-800 bg-white px-2 text-sm"
                      >
                        Remove Objective
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={addNewObjective}
          className="rounded-3xl bg-blue-900 p-2 pt-4 text-white"
        >
          Add objective
        </button>
        <div className="px-4 py-10">
          <div className="flex flex-col">
            <h3 className="font-bold text-black">Reward Type</h3>
            <p className="mt-2">
              How do you plan on rewarding users who complete objectives, tiers,
              etc, in your loyalty program?
            </p>
            <p className="mt-2">
              You can simply reward externally using built in
              &quot;Points.&quot; Or, you can deposit and reward users with
              ERC20 tokens, ERC721 tokens, or ERC1155 tokens.
            </p>
            <p className="mt-4 font-semibold">
              Once your loyalty contract is deployed, this action cannot be
              undone.
            </p>
            <p className="mt-2">
              Before you proceed, you should{" "}
              <span className="underline">learn more about reward types.</span>
            </p>
            <div className="flex flex-col pt-10">
              <span>Select Reward Type</span>
              <select
                onChange={(e) => selectRewardType(e)}
                defaultValue="Points"
                className="h-10 w-full rounded-md bg-stone-100 pl-2"
              >
                <option value={RewardType.Points}>Points</option>
                <option value={RewardType.ERC20}>ERC20</option>
                <option value={RewardType.ERC721}>ERC721</option>
                <option value={RewardType.ERC1155}>ERC1155</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-4 py-10">
          <div className="flex flex-col">
            <h3 className="font-bold text-black">Loyalty Program End Date</h3>
            <p className="mt-2">
              When do you want your loyalty program to end? Must be greater than
              1 day in the future. Once deployed, action cannot be undone.
            </p>
          </div>
          <div className="flex flex-col pt-10">
            <span>Select Program End Date</span>
            <DatePicker
              selected={programEndsAt}
              className="h-10 w-full bg-stone-100 pl-2"
              onChange={(date) => handleSetProgramEnd(date)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={formatLoyaltyInputs}
        className="mt-10 rounded-3xl bg-blue-900 p-4 text-white"
      >
        Submit program details
      </button>
      <button
        className="mt-10 rounded-3xl bg-green-900 p-4 text-white"
        onClick={() => signIn()}
      >
        Test Sign in
      </button>
      <button
        className="mt-10 rounded-3xl bg-violet-800 p-4 text-white"
        onClick={handleContractDeploy}
      >
        Deploy loyalty test
      </button>
      <button
        className="mt-10 rounded-3xl bg-violet-800 p-4 text-white"
        onClick={deployEscrowContract}
      >
        Deploy escrow test
      </button>
      <div className="flex flex-col pt-2">
        <EscrowApprovals />
      </div>
    </div>
  );
}
