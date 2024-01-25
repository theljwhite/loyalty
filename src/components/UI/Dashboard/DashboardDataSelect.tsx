import React from "react";
import { DownChevron } from "./Icons";

type SelectOptions = {
  id: number;
  title: string;
  value: any;
  [otherProperties: string]: unknown;
};

interface DashboardDataSelectProps {
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => any;
  selectDefaultValue?: string;
  selectOptions?: SelectOptions[];
  selectImages?: Record<string | number, JSX.Element>;
  selectName?: string;
  imageBackgrounds?: Record<string | number, string>;
  activeTab: number | string;
}

export default function DashboardDataSelect({
  onSelectChange,
  selectDefaultValue,
  selectOptions,
  selectImages,
  selectName,
  imageBackgrounds,
  activeTab,
}: DashboardDataSelectProps) {
  return (
    <div className="flex">
      <div className="mb-2 flex flex-1 items-end p-0">
        <div className="w-full">
          <div role="group" className="relative w-full">
            <div className="flex justify-between">
              <div className="relative flex" />
            </div>
            <div className="relative isolate flex w-full">
              <div className="me-[-1px] flex h-8 w-auto flex-[0_0_auto] items-center rounded-l-md border border-dashboard-border1 bg-neutral-4 pe-3 ps-3 text-[13px] font-normal">
                {selectImages && imageBackgrounds && (
                  <div
                    className={`${imageBackgrounds[activeTab]} flex h-6 w-6 items-center justify-center rounded-full p-2`}
                  >
                    <div className="mx-2.5 h-5 w-5 whitespace-nowrap">
                      {selectImages[activeTab]}
                    </div>
                  </div>
                )}
                {selectImages && !imageBackgrounds && (
                  <div className="p-2` flex h-6 w-6 items-center justify-center rounded-full">
                    <div className="h-5 w-5 whitespace-nowrap">
                      {selectImages[activeTab]}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative h-fit w-[220px] text-dashboard-lightGray ">
                <select
                  {...(onSelectChange && {
                    onChange: (e) => onSelectChange(e),
                    name: selectName ?? `${activeTab} select`,
                  })}
                  className="relative h-8 w-full min-w-0 appearance-none rounded-r-md border border-dashboard-border1 ps-3 text-[13px] font-normal leading-normal text-dashboard-lightGray outline-none"
                >
                  {selectDefaultValue && (
                    <option
                      hidden
                      defaultValue={selectDefaultValue}
                      className="block min-w-[1.2em] whitespace-nowrap bg-white px-0.5 font-normal"
                    >
                      {selectDefaultValue}
                    </option>
                  )}
                  {selectOptions &&
                    selectOptions.map((option) => {
                      return (
                        <option
                          key={option.id}
                          value={option.value}
                          className="block min-w-[1.2em] whitespace-nowrap bg-white px-0.5 font-normal"
                        >
                          {option.title}
                        </option>
                      );
                    })}
                </select>
                <div className="pointer-none top-half absolute right-0.5 inline-flex h-full w-6 translate-y-[-2/4] items-center justify-center text-xl text-dashboard-lightGray">
                  <div className="h-[1em] w-[1em]">
                    <DownChevron size={20} color="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
