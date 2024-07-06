import { CaretOne, DownCaretOne, PercentArrow } from "../Icons";

interface StatsLineVisualizerProps {
  mainStatTitle: string;
  mainStat: string;
  percentChange?: number;
  dropOptions?: string[];
  dropId?: string;
  fullReportPath?: string;
  data?: any[];
  icon: JSX.Element;
}

export default function StatsLineVisualizer({
  mainStatTitle,
  mainStat,
  percentChange,
  dropOptions,
  dropId,
  fullReportPath,
  data,
  icon,
}: StatsLineVisualizerProps) {
  return (
    <div className="w-full rounded-2xl border border-dashboard-border1 p-4 md:p-6 ">
      <div className="mb-4 flex justify-between border-b border-dashboard-border1 pb-4">
        <div className="flex items-center">
          <div className="me-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
            <span className="flex h-10 w-10 items-center justify-center text-gray-500">
              {icon}
            </span>
          </div>
          <div>
            <h5 className="pb-1 text-2xl font-bold leading-none text-gray-900">
              {mainStat}
            </h5>
            <p className="text-sm font-normal text-gray-500">{mainStatTitle}</p>
          </div>
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

      <div id="column-chart">
        {/* TODO */}
        {JSON.stringify(data)}
      </div>
      <div className="grid grid-cols-1 items-center justify-between border-t border-gray-200">
        {dropOptions && (
          <div className="flex items-center justify-between pt-5">
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle={dropId}
              data-dropdown-placement="bottom"
              className="inline-flex items-center text-center text-sm font-medium text-gray-500 hover:text-gray-900"
              type="button"
            >
              {dropOptions[0]}
              <DownCaretOne />
            </button>

            <div
              id="lastDaysdropdown"
              className="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow"
            >
              <ul
                className="py-2 text-sm text-gray-700"
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
