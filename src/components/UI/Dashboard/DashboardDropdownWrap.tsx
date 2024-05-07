import Link from "next/link";
import { SettingsOne } from "./Icons";

interface DashboardDropdownWrapProps {
  dropTitle: string;
  secondTitle?: string;
  secondTitleIcon?: JSX.Element;
  secondTitleAction?: () => any;
  secondTitleRoute?: string;
  additionalAction?: () => any;
  actionTitle?: string;
  actionIcon?: JSX.Element;
  children: React.ReactNode;
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
  actionTitle,
  actionIcon,
  children,
  setIsDropdownOpen,
}: DashboardDropdownWrapProps) {
  const lightWrapClass =
    "border-[rgba(19,_19,_22,_.05)] bg-dashboardLight-body text-dashboard-activeTab";
  const divideClass = "divide-gray-100 border-gray-100";

  //this approach prob isnt going to be best for dropdowns, will update it
  const closeDropDownOnOverlayClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (e.target === e.currentTarget) setIsDropdownOpen(false);
  };

  return (
    <div
      onClick={closeDropDownOnOverlayClick}
      className="fixed left-0 top-0 z-[1400] flex h-dvh w-screen items-start justify-center overflow-auto overscroll-y-none"
    >
      <div className="fixed left-0 top-0 z-auto min-w-max">
        <div
          className={`${lightWrapClass} relative isolate w-[272px] rounded-[0.75rem] border leading-5 outline-none [box-shadow:0_20px_25px_-5px_rgba(0,0,0,.1),0_8px_10px_-6px_rgba(0,0,0,.1)]`}
        >
          <div className="border-black/4 shadow-black/3 rounded-b-lg rounded-t-xl border-b bg-white bg-clip-padding text-dashboardLight-secondary">
            <div className="p-3">
              <div className="text-sm font-medium">{dropTitle}</div>
              {secondTitle && secondTitleIcon && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex size-6 items-center justify-center rounded bg-gray-100 p-1 text-dashboardLight-secondary">
                    {secondTitleIcon}
                  </div>
                  <span className="flex-grow truncate text-dashboardLight-primary">
                    {secondTitle}
                  </span>
                  {secondTitleAction ? (
                    <div
                      onClick={secondTitleAction}
                      className="transition-color hover:text-primary rounded-lg border border-black/5 bg-white bg-clip-padding p-1 shadow-sm ring-gray-200 focus:outline-none focus:ring-2"
                    >
                      <SettingsOne size={16} color="currentColor" />
                    </div>
                  ) : (
                    <Link href={secondTitleRoute ?? ""}>
                      <div className="transition-color hover:text-primary rounded-lg border border-black/5 bg-white bg-clip-padding p-1 shadow-sm ring-gray-200 focus:outline-none focus:ring-2">
                        <SettingsOne size={16} color="currentColor" />
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div
              className={`${divideClass} rounded-b-inherit max-h-[50dvh] divide-y divide-gray-100  overflow-y-auto border-t`}
            >
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
        </div>
      </div>
    </div>
  );
}
