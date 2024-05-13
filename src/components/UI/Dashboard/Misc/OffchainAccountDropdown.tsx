import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ROUTE_DASHBOARD_CREATOR_PROFILE } from "~/configs/routes";
import DashboardDropdownWrap from "../DashboardDropdownWrap";
import { SettingsOne, SignOutSquare } from "../Icons";

interface OffchainAccountDropdownProps {
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OffchainAccountDropdown({
  setIsDropdownOpen,
}: OffchainAccountDropdownProps) {
  const { data: session } = useSession();

  return (
    <DashboardDropdownWrap customDropDown setIsDropdownOpen={setIsDropdownOpen}>
      <div className="border-black/4 max-w-[calc(-2rem + 100vw)] relative flex w-96 items-stretch justify-start overflow-hidden rounded-xl border font-lunch text-dashboardLight-secondary shadow-xl [flex-flow:column]">
        <div className="flex items-stretch justify-start overflow-hidden rounded-xl bg-white [flex-flow:column]">
          <span className="flex w-full items-center justify-start gap-4 px-5 py-4 [flex-flow:row]">
            <span className="relative flex items-stretch justify-center [flex-flow:row]">
              <span className="relative flex h-9 w-9 shrink-0 items-stretch justify-start overflow-hidden rounded-full [flex-flow:row]">
                {session?.user.image ? (
                  <Image
                    width={36}
                    height={36}
                    alt="user avatar"
                    src={session?.user.image}
                  />
                ) : (
                  <Image
                    width={36}
                    height={36}
                    alt="default avatar"
                    src={"/utilityImages/blankAvatar.svg"}
                  />
                )}
              </span>
            </span>
            <span className="flex min-w-0 items-stretch justify-center text-left [flex-flow:column]">
              <span className="flex items-center gap-1 text-sm font-semibold leading-[1.38]">
                {session?.user.name}
              </span>
              <span className="flex items-center font-lunch text-sm leading-[1.38]">
                {session?.user.email}
              </span>
            </span>
          </span>
          <div className="flex items-stretch justify-start [flex-flow:column]">
            <div className="ml-12 flex items-stretch justify-between gap-2 px-5 pb-4 [flex-flow:row]">
              <Link
                href={ROUTE_DASHBOARD_CREATOR_PROFILE}
                className="bg-unset border-black/4 relative relative isolate flex inline-flex flex-1 cursor-pointer items-center rounded-full border px-1.5 py-1 text-xs font-semibold leading-[1.33] text-dashboardLight-secondary [box-shadow:rgba(0,_0,_0,_0.08)_0px_2px_3px_-1px,_rgba(0,_0,_0,_0.02)_0px_1px_0px_0px] hover:bg-neutral-2"
              >
                <span className="flex-unset flex items-center justify-center gap-2 [flex-flow:row]">
                  <SettingsOne size={16} color="currentColor" />
                  Manage account
                </span>
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="bg-unset border-black/4 relative relative isolate flex inline-flex flex-1 cursor-pointer items-center justify-center rounded-full border px-1.5 py-1 text-xs font-semibold leading-[1.33] text-dashboardLight-secondary [box-shadow:rgba(0,_0,_0,_0.08)_0px_2px_3px_-1px,_rgba(0,_0,_0,_0.02)_0px_1px_0px_0px] hover:bg-neutral-2"
              >
                <span className="flex-unset flex items-center justify-center gap-2 [flex-flow:row]">
                  <SignOutSquare size={16} color="currentColor" />
                  Sign out
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardDropdownWrap>
  );
}
