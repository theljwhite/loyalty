import DashboardInfoBanner from "./DashboardInfoBanner";

//TODO 2/4 - provide more dynamic types for selections and options

type Option = {
  value: any;
  title: string;
};

type Selection = {
  label: string;
  info: string;
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
};

interface DashboardSelectBoxProps {
  title: string;
  description: string;
  selections: Selection[];
  warning?: string;
  customSelect?: JSX.Element;
  isRequiredField?: boolean;
}
export default function DashboardSelectBox({
  title,
  description,
  selections,
  warning,
  customSelect,
  isRequiredField,
}: DashboardSelectBoxProps) {
  return (
    <div className="flex flex-1 flex-row items-start rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6">
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-start">
          <p className="text-md font-semibold leading-6">
            {title}
            {isRequiredField && (
              <code className="ml-1 inline-flex items-center gap-1 whitespace-nowrap bg-dashboard-badge py-0.5 pe-1.5 ps-1.5 align-middle text-xs font-normal leading-[1.4] text-dashboard-required">
                Required
              </code>
            )}
          </p>
        </div>
        <p className="mb-4 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
          {description}
        </p>
        {warning && <DashboardInfoBanner infoType="warn" info={warning} />}
      </div>
      <div className="ms-6 flex-1">
        <div className="flex flex-col">
          {customSelect ? (
            <div>{customSelect}</div>
          ) : (
            selections.map((sel, index) => {
              return (
                <div key={index} className="flex w-full flex-col">
                  <div className="mb-0.5 flex flex-row items-center justify-between">
                    <label className="mb-0 text-sm font-semibold leading-5">
                      {sel.label}
                    </label>
                  </div>
                  <p className="text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                    {sel.info}
                  </p>

                  <div className="mb-[0.5em]">
                    <div className="relative w-full">
                      <select
                        onChange={sel.onSelect}
                        className="relative h-8 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                      >
                        {sel.options.map((option: Option, index: number) => {
                          return (
                            <option
                              key={index}
                              value={option.value}
                              className="block min-w-[1.2em] whitespace-nowrap bg-white px-0.5 font-normal"
                            >
                              {option.title}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
