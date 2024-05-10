import React from "react";
import { type EscrowState, type ProgramState } from "@prisma/client";
import { ClockIcon, WarningIcon, SelectedCheck } from "./Icons";

interface DashboardStateStatusProps {
  programState?: ProgramState;
  escrowState?: EscrowState;
  containerBg: string;
}

export const loyaltyStateDisplay = new Map<
  ProgramState,
  { message: string; color: string; icon: JSX.Element }
>([
  [
    "Idle",
    {
      message:
        "Loyalty program contract is currently idling, awaiting further setup",
      color: "bg-neutral-100",
      icon: <ClockIcon size={16} color="currentColor" />,
    },
  ],
  [
    "AwaitingEscrowSetup",
    {
      message:
        "Loyalty contract is waiting for escrow contract to be deployed or set up",
      color: "bg-orange-100",
      icon: <WarningIcon size={16} color="currentColor" />,
    },
  ],
  [
    "Active",
    {
      message:
        "Loyalty contract is currently active, tracking objectives and/or tiers",
      color: "bg-green-100",
      icon: <SelectedCheck size={16} color="currentColor" />,
    },
  ],
  [
    "Canceled",
    {
      message: "Loyalty contract has been canceled by its creator",
      color: "bg-red-100",
      icon: <WarningIcon size={16} color="currentColor" />,
    },
  ],
  [
    "Completed",
    {
      message: "Loyalty program has concluded",
      color: "bg-green-100",
      icon: <SelectedCheck size={16} color="currentColor" />,
    },
  ],
]);

export const escrowStateDisplay = new Map<
  EscrowState,
  { message: string; color: string; icon: JSX.Element }
>([
  [
    "Idle",
    {
      message:
        "Escrow contract is currently idling, awaiting loyalty program to be started",
      color: "bg-neutral-100",
      icon: <ClockIcon size={16} color="currentColor" />,
    },
  ],
  [
    "AwaitingEscrowApprovals",
    {
      message:
        "Escrow contract is waiting for sender approval, reward approval, or deposit key to be set",
      color: "bg-orange-100",
      icon: <WarningIcon size={16} color="currentColor" />,
    },
  ],
  [
    "AwaitingEscrowSettings",
    {
      message: "Escrow contract is waiting for its customization settings",
      color: "bg-orange-100",
      icon: <WarningIcon size={16} color="currentColor" />,
    },
  ],
  [
    "DepositPeriod",
    {
      message: "Escrow contract is currently in its rewards deposit period",
      color: "bg-orange-100",
      icon: <WarningIcon size={16} color="currentColor" />,
    },
  ],
  [
    "InIssuance",
    {
      message:
        "Your escrow contract is currently in issuance, rewarding users for their progress",
      color: "bg-green-100",
      icon: <SelectedCheck size={16} color="currentColor" />,
    },
  ],
  [
    "Canceled",
    {
      message: "Your escrow contract has been canceled",
      color: "bg-red-100",
      icon: <WarningIcon size={16} color="currentColor" />,
    },
  ],
  [
    "Completed",
    {
      message:
        "Escrow contract has exhausted all of its funds or loyalty program has concluded",
      color: "bg-green-100",
      icon: <SelectedCheck size={16} color="currentColor" />,
    },
  ],
  [
    "Frozen",
    {
      message: "Escrow contract is frozen and is not issuing any tokens",
      color: "bg-red-100",
      icon: <WarningIcon size={16} color="currentColor" />,
    },
  ],
]);

export default function DashboardStateStatus({
  programState,
  escrowState,
  containerBg,
}: DashboardStateStatusProps) {
  return (
    <div className="flex flex-col">
      <div
        className={`${containerBg} relative flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6`}
      >
        <div className="flex flex-row items-start">
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-base font-semibold leading-6">
                {programState ? "Loyalty Status" : "Escrow Status"}
              </p>
              {programState ? (
                <span
                  className={`${loyaltyStateDisplay.get(programState)
                    ?.color} inline-block whitespace-nowrap rounded pe-1.5 ps-1.5 align-middle text-[13px] font-normal text-black/80`}
                >
                  {programState}
                </span>
              ) : (
                escrowState && (
                  <span
                    className={`${escrowStateDisplay.get(escrowState)
                      ?.color} inline-block whitespace-nowrap rounded pe-1.5 ps-1.5 align-middle text-[13px] font-normal text-black/80`}
                  >
                    {escrowState}
                  </span>
                )
              )}
            </div>
            {programState ? (
              <p className="text-[13px] font-normal text-dashboard-lightGray">
                {loyaltyStateDisplay.get(programState)?.message}
              </p>
            ) : (
              escrowState && (
                <p className="text-[13px] font-normal text-dashboard-lightGray">
                  {escrowStateDisplay.get(escrowState)?.message}
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
