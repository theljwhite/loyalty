import { useState } from "react";
import { ClipboardOne, EyeTransform } from "./Icons";
import { copyTextToClipboard } from "~/helpers/copyTextToClipboard";
import { DataTableSpinner } from "../Misc/Spinners";

interface DashboardCopyDataBoxProps {
  title: string;
  description: string;
  copyBoxLabel: string;
  outlink?: string;
  outlinkTitle?: string;
  dataToCopy: string | number;
  copySuccessMessage: string;
  isSecret?: boolean;
  additionalAction?: React.MouseEventHandler;
  actionTitle?: string;
  containerBg?: string;
  showBorder?: boolean;
  dataLoading?: boolean;
}

export default function DashboardCopyDataBox({
  title,
  description,
  copyBoxLabel,
  outlink,
  outlinkTitle,
  dataToCopy,
  copySuccessMessage,
  isSecret,
  additionalAction,
  actionTitle,
  containerBg,
  showBorder,
  dataLoading,
}: DashboardCopyDataBoxProps) {
  const [isHidden, setIsHidden] = useState<boolean>(true);

  return (
    <div
      className={`${containerBg ?? "bg-white"} ${
        showBorder ? "border border-dashboard-border1" : "border-none"
      } mt-8 flex flex-1 flex-row items-start rounded-2xl py-8 pe-6 ps-6`}
    >
      <div className="block flex-1">
        <div className="mb-1 flex items-center justify-start">
          <p className="text-md font-semibold leading-6 text-dashboard-body">
            {title}
          </p>
        </div>
        <span className="mt-2 text-[13px] font-normal leading-[1.125] text-black opacity-65">
          {description}
        </span>
        {outlink && (
          <a target="_blank" rel="noreferrer" href={outlink}>
            <span className="mt-2 block text-[13px] font-semibold leading-[1.125] text-primary-1">
              {outlinkTitle}
            </span>
          </a>
        )}
      </div>
      <div className="ms-1 flex flex-1 flex-col overflow-hidden">
        <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
          <div className="flex w-full justify-between">
            <div className="flex">
              <p className="overflow-hidden truncate text-sm font-semibold capitalize leading-5 text-white">
                {copyBoxLabel}
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              {isSecret && (
                <button
                  onClick={() => setIsHidden(!isHidden)}
                  className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0  align-middle leading-[1.2] text-white outline-none"
                >
                  <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                    <EyeTransform
                      size={20}
                      color="currentColor"
                      line={isHidden}
                    />
                  </span>
                </button>
              )}
              <button
                onClick={() =>
                  copyTextToClipboard(String(dataToCopy), copySuccessMessage)
                }
                className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0 align-middle leading-[1.2] text-white outline-none"
              >
                <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                  <ClipboardOne size={20} color="currentColor" />
                </span>
              </button>
            </div>
          </div>
          <div className="relative flex">
            {dataLoading ? (
              <div className="flex w-full items-center justify-center">
                <div className="h-5 w-5">
                  <DataTableSpinner size={5} />
                </div>
              </div>
            ) : (
              <pre
                className={`${
                  isHidden && isSecret
                    ? "text-transparent [text-shadow:white_0px_0px_6px]"
                    : "text-white"
                } whitespace-prewrap m-0 p-0 text-sm font-normal leading-5`}
              >
                {dataToCopy}
              </pre>
            )}
          </div>
        </div>
        {additionalAction && (
          <button
            onClick={additionalAction}
            className="relative ml-2 mt-4 inline-flex h-auto min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md pe-3 ps-3 align-baseline text-[13px] font-semibold leading-normal text-primary-1 outline-none"
          >
            + {actionTitle}
          </button>
        )}
      </div>
    </div>
  );
}
