import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import SessionDropdown from "./Misc/SessionDropdown";
interface DashboardHeaderProps {
  title: string;
  info?: string;
}

export default function DashboardHeader({ title, info }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  return (
    <>
      <div className="relative mb-4 flex items-start justify-between gap-4">
        <div className="flex w-full max-w-[80ch] flex-col gap-3">
          <div className="w-full space-y-2">
            <h1 className="truncate text-2xl font-medium tracking-tight">
              {title}
            </h1>
            {info && (
              <p className="truncate text-sm text-dashboard-lighterText">
                {info}{" "}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="box-border w-fit font-normal">
            <div className="flex flex-row flex-nowrap items-center justify-start gap-2">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                type="button"
                className="h-unset w-unset m-0 inline-flex cursor-pointer items-center justify-center rounded-full border-none p-0 text-sm font-normal tracking-[0.5px] antialiased duration-100 [transition-property:background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform] "
              >
                <div className="relative flex h-8 w-8 shrink-0 flex-row flex-nowrap items-stretch justify-start overflow-hidden rounded-full bg-dashboard-body2">
                  {session?.user.image ? (
                    <Image
                      width={32}
                      height={32}
                      src={session.user.image}
                      alt="user avatar"
                      className="h-auto max-w-full object-cover align-middle"
                    />
                  ) : (
                    <Image
                      width={32}
                      height={32}
                      src={"utilityImages/blankAvatar.svg"}
                      alt="default avatar"
                      className="h-auto max-w-full object-cover align-middle"
                    />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
        {isDropdownOpen && (
          <SessionDropdown setIsDropdownOpen={setIsDropdownOpen} />
        )}
      </div>
    </>
  );
}
