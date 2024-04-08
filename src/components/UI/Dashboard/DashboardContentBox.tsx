import Link from "next/link";
import DashboardInfoBanner from "./DashboardInfoBanner";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";

interface DashboardContentBoxProps {
  title: string;
  titleType?: string;
  description: string;
  descriptionTwo?: string;
  learnMoreText?: string;
  learnMorePath?: string;
  warning?: string;
  content: JSX.Element;
}

export default function DashboardContentBox({
  title,
  titleType,
  description,
  descriptionTwo,
  learnMoreText,
  learnMorePath,
  warning,
  content,
}: DashboardContentBoxProps) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6 ">
      <div className="flex w-full justify-between gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <p className="text-md relative font-semibold leading-6">
              {title}
              {titleType && (
                <code className="ml-1 inline-flex items-center gap-1 whitespace-nowrap bg-dashboard-badge py-0.5 pe-1.5 ps-1.5 align-middle text-xs font-normal leading-[1.4] text-dashboard-required">
                  {titleType}
                </code>
              )}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="mb-4 text-[13px] font-normal leading-[1.125rem] text-dashboard-lightGray">
              {description}
            </p>
            {descriptionTwo && (
              <p className="mb-4 text-[13px] font-normal leading-[1.125rem] text-dashboard-lightGray">
                {descriptionTwo}
              </p>
            )}
            {warning && <DashboardInfoBanner infoType="warn" info={warning} />}
            {learnMoreText && (
              <Link
                href={learnMorePath ?? ROUTE_DOCS_MAIN}
                className="cursor-pointer text-[13px] font-semibold leading-[1.125] text-primary-1 outline-none hover:opacity-75 "
              >
                {learnMoreText}
              </Link>
            )}
          </div>
        </div>
        <div>{content}</div>
      </div>
    </div>
  );
}
