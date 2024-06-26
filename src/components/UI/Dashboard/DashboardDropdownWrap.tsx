import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useOnClickOutside } from "~/helpers/windowEvents";
import { SettingsOne } from "./Icons";

interface DashboardDropdownWrapProps {
  dropTitle?: string;
  secondTitle?: string;
  secondTitleIcon?: JSX.Element;
  secondTitleAction?: () => any;
  secondTitleRoute?: string;
  additionalAction?: () => any;
  additionalRoute?: string;
  actionTitle?: string;
  actionIcon?: JSX.Element;
  children: React.ReactNode;
  customDropShadow?: string;
  customDropDown?: boolean;
  setIsDropdownOpen:
    | React.Dispatch<React.SetStateAction<boolean>>
    | ((isOpen: boolean) => any);
}

export default function DashboardDropdownWrap({
  dropTitle,
  secondTitle,
  secondTitleIcon,
  secondTitleAction,
  secondTitleRoute,
  additionalAction,
  additionalRoute,
  actionTitle,
  actionIcon,
  children,
  customDropShadow,
  customDropDown,
  setIsDropdownOpen,
}: DashboardDropdownWrapProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { events } = useRouter();

  const closeDropdownHandler = () => {
    setIsDropdownOpen(false);
  };

  useOnClickOutside(dropdownRef, closeDropdownHandler);

  useEffect(() => {
    events.on("routeChangeStart", closeDropdownHandler);
    return () => {
      events.off("routeChangeStart", closeDropdownHandler);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`${
        customDropShadow ?? "shadow-xl"
      } relative -top-[calc(48px-0.0625rem)] isolate w-[256px] animate-[fade-in_100ms_ease-in-out] space-y-px rounded-xl border border-black/5 bg-dashboardLight-body bg-clip-padding leading-5 text-dashboard-activeTab`}
    >
      {customDropDown ? (
        <div>{children}</div>
      ) : (
        <div>
          <div className="border-black/4 shadow-black/3 rounded-b-lg rounded-t-xl border-b bg-white bg-clip-padding text-dashboardLight-secondary">
            <div className="p-3">
              <div className="text-xs font-medium">{dropTitle}</div>
              {secondTitle && secondTitleIcon && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex size-6 items-center justify-center rounded bg-gray-100 p-1 text-dashboardLight-secondary">
                    {secondTitleIcon}
                  </div>
                  <span className="flex-grow truncate text-sm text-dashboardLight-primary">
                    {secondTitle}
                  </span>
                  {secondTitleAction ? (
                    <div
                      onClick={secondTitleAction}
                      className="transition-color hover:text-primary rounded-lg border border-black/5 bg-white bg-clip-padding p-1 shadow-sm ring-gray-200 focus:outline-none focus:ring-2"
                    >
                      <SettingsOne size={14} color="currentColor" />
                    </div>
                  ) : (
                    <Link href={secondTitleRoute ?? ""}>
                      <div className="transition-color hover:text-primary rounded-lg border border-black/5 bg-white bg-clip-padding p-1 shadow-sm ring-gray-200 focus:outline-none focus:ring-2">
                        <SettingsOne size={14} color="currentColor" />
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-b-inherit max-h-[50dvh] divide-y divide-gray-100 divide-gray-100 overflow-y-auto  border-t border-gray-100">
              {children}
            </div>
          </div>
          {additionalAction && (
            <div
              onClick={additionalAction}
              className="focus:text-primary group relative flex cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-2 text-dashboardLight-secondary before:absolute before:inset-0 before:z-50 before:rounded-xl before:ring-gray-200 focus:outline-none before:focus:ring-[0.15625rem]"
            >
              <div className="p-0.5 text-dashboardLight-secondary">
                {actionIcon}
              </div>
              <span className="text-sm">{actionTitle}</span>
            </div>
          )}
          {additionalRoute && (
            <Link
              href={additionalRoute}
              className="focus:text-primary group relative flex cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-2 text-dashboardLight-secondary before:absolute before:inset-0 before:z-50 before:rounded-xl before:ring-gray-200 focus:outline-none before:focus:ring-[0.15625rem]"
            >
              <div className="p-0.5 text-dashboardLight-secondary">
                {actionIcon}
              </div>
              <span className="text-sm">{actionTitle}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
