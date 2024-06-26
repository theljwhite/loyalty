import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { RightChevron } from "./Icons";
import SessionDropdown from "./Misc/SessionDropdown";

interface DashboardBreadcrumbProps {
  firstTitle?: string;
  secondTitle?: string;
}

export default function DashboardBreadcrumb({
  firstTitle,
  secondTitle,
}: DashboardBreadcrumbProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { pathname } = useRouter();
  const { data: session } = useSession();

  return (
    <>
      <div className="initial:text-secondary flex items-center gap-2 font-lunch">
        <div className="-translate-y-[1px] truncate text-[13px] font-medium capitalize text-dashboard-activeTab">
          {firstTitle ?? pathname.split("/").pop()}
        </div>
        <div className="text-dashboard-lightGray2">
          <RightChevron size={12} color="currentColor" />
        </div>
        {secondTitle && (
          <div className="-translate-y-[1px] truncate text-[13px] text-dashboard-lighterText">
            {secondTitle}
          </div>
        )}
      </div>
      <div className="box-border w-fit font-normal">
        <div className="flex flex-row flex-nowrap items-center justify-start gap-2">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            type="button"
            className="bg-unset leading-1 m-0 inline-flex cursor-pointer items-center justify-center rounded-full border-none p-0 font-normal outline-none"
          >
            <div className="relative flex h-8 w-8 shrink-0 flex-row flex-nowrap items-stretch justify-start overflow-hidden rounded-full  ">
              {session?.user.image ? (
                <Image
                  className="h-auto max-w-full"
                  src={session?.user.image}
                  alt="user avatar"
                  width={32}
                  height={32}
                />
              ) : (
                <Image
                  className="h-auto max-w-full"
                  src={"/utilityImages/blankAvatar"}
                  alt="default avatar"
                  width={32}
                  height={32}
                />
              )}
            </div>
          </button>
        </div>
      </div>
      {isDropdownOpen && (
        <SessionDropdown setIsDropdownOpen={setIsDropdownOpen} />
      )}
    </>
  );
}
