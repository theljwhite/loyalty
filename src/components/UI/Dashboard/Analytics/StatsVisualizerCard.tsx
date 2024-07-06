import { CaretOne, DownCaretOne, PercentArrow } from "../Icons";

//TODO - add graph/visualizer at some point

interface StatsVisualizerProps {
  mainStat: string;
  description: string;
  percentChange?: number;
  dropOptions?: string[];
  dropId?: string;
  fullReportPath?: string;
  data?: any[];
}

export default function StatsVisualizerCard({
  mainStat,
  description,
  percentChange,
  dropOptions,
  dropId,
  fullReportPath,
  data,
}: StatsVisualizerProps) {
  return (
    <div className="w-full rounded-2xl border border-dashboard-border1 p-4 md:p-6">
      <div className="flex justify-between">
        <div>
          <h5 className="pb-2 text-3xl font-bold leading-none text-gray-800">
            {mainStat}
          </h5>
          <p className="text-base font-normal leading-[1.125rem] text-dashboard-lightGray">
            {description}
          </p>
        </div>
        {percentChange && (
          <div>
            <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
              {percentChange}%
              <PercentArrow />
            </span>
          </div>
        )}
      </div>
      <div id="data-series-chart">
        {/* TODO */}
        {JSON.stringify(data)}
      </div>
      <div className="mt-5 grid grid-cols-1 items-center justify-between border-t border-dashboard-border1">
        {dropOptions && (
          <div className="flex items-center justify-between pt-5">
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle={dropId}
              data-dropdown-placement="bottom"
              className="inline-flex items-center text-center text-sm font-medium text-dashboard-body"
              type="button"
            >
              {dropOptions[0]}
              <DownCaretOne />
            </button>

            <div className="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700">
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownDefaultButton"
              >
                {dropOptions.map((option, index) => {
                  return (
                    <li key={index}>
                      <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                        {option}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            {fullReportPath && (
              <a
                target="_blank"
                rel="noreferrer"
                href={fullReportPath}
                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold uppercase text-primary-1 hover:opacity-75"
              >
                Full Report
                <CaretOne rotate="180" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
