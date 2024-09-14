import { useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import { getStartDateFromDropOption } from "~/constants/timeAndDate";
import { type ChartType } from "~/server/api/routers/events";
import { type HorizontalBarSeries } from "~/utils/programAnalytics";
import useOnClickOutside from "~/helpers/windowEvents";
import { DashboardLoadingSpinnerTwo } from "../../Misc/Spinners";
import { CaretOne, DownCaretOne, PercentArrow } from "../Icons";
import HorizontalBarChart from "./HorizontalBarChart";
import { HorizontalBarReturnShape } from "~/utils/programAnalytics";

//TODO - logic for displaying percent change
//TODO - the useEffect in here can be prevented by conditionally checking for data in...
//...wherever this component is rendered, but loading UI will have to be moved.

interface StatsHorizontalBarVisualizerCardProps {
  title: string;
  mainStat: string;
  percentChange?: number;
  dropOptions?: string[];
  defaultDropChoice?: string;
  fullReportPath?: string;
  xCategories: string[];
  data: HorizontalBarSeries[];
  dataLoading: boolean;
  loyaltyAddress: string;
  chartType: ChartType | null;
}

export default function StatsHorizontalBarVisualizerCard({
  title,
  mainStat,
  percentChange,
  dropOptions,
  defaultDropChoice,
  fullReportPath,
  xCategories,
  data,
  dataLoading,
  loyaltyAddress,
  chartType,
}: StatsHorizontalBarVisualizerCardProps) {
  const dropChoices = dropOptions?.map((option) => ({
    option,
    selected: option === defaultDropChoice,
  }));

  const [isDropOpen, setIsDropOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [statistic, setStatistic] = useState<string>("");
  const [choices, setChoices] = useState<
    { option: string; selected: boolean }[]
  >(dropChoices ?? []);

  const [series, setSeries] = useState<HorizontalBarSeries[]>(data);
  const [categories, setCategories] = useState<string[]>(xCategories);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(dropdownRef, () => setIsDropOpen(false));

  const { isLoading: refetchLoading, mutateAsync: getEventsInRange } =
    api.events.getEventsForChart.useMutation();

  useEffect(() => {
    if (data && data.length > 0 && !dataLoading) {
      setSeries(data);
    }
  }, [data, dataLoading]);

  const handleDropOptionSelect = async (option: string): Promise<void> => {
    handleChoiceStateUponSelect(option);
    try {
      const selection = getStartDateFromDropOption(option);

      if (!selection || !chartType) throw new Error();

      const result = (await getEventsInRange({
        startDate: selection,
        endDate: new Date(),
        loyaltyAddress: loyaltyAddress ?? "",
        chartType: chartType,
      })) as HorizontalBarReturnShape<any[]> | undefined;

      if (!result) throw new Error();

      const sumOfSeries = result.series
        .map((item) => item.data)
        .flat()
        .reduce((prev, curr) => prev + curr, 0);

      setSeries(result.series);
      setCategories(result.xCategories);
      setStatistic(sumOfSeries.toFixed(4));
    } catch (error) {
      setError("Failed to fetch statistic. Try later.");
    }
  };

  const handleChoiceStateUponSelect = (option: string): void => {
    setIsDropOpen(false);
    const selectedChoice = choices.map((choice) => ({
      ...choice,
      selected: choice.option === option,
    }));
    setChoices(selectedChoice);
  };

  return (
    <div className="w-full rounded-2xl border border-dashboard-border1 p-4 md:p-6">
      <div className="flex justify-between border-b border-gray-200 pb-3">
        <dl>
          <dt className="pb-1 text-base font-normal text-gray-500">{title}</dt>
          <dd className="text-3xl font-bold leading-none text-gray-900">
            {dataLoading || refetchLoading ? (
              <DashboardLoadingSpinnerTwo size={20} />
            ) : statistic ? (
              statistic
            ) : (
              mainStat
            )}
          </dd>
        </dl>
        <div>
          {percentChange && (
            <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
              <svg
                className="me-1.5 h-2.5 w-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13V1m0 0L1 5m4-4 4 4"
                />
              </svg>
              %{percentChange}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 py-3">
        {series.map((item, index) => {
          return (
            <dl key={index}>
              <dt className="pb-1 text-base font-normal text-gray-500">
                {item.name}
              </dt>
              <dd
                className={`text-xl font-bold leading-none text-[${item.color}]`}
              >
                {dataLoading || refetchLoading ? (
                  <span>
                    <DashboardLoadingSpinnerTwo size={20} />
                  </span>
                ) : (
                  item.data.reduce((prev, curr) => prev + curr, 0).toFixed(4)
                )}
              </dd>
            </dl>
          );
        })}
      </div>

      {dataLoading || refetchLoading ? (
        <div className="flex min-h-[175px] items-center justify-center">
          <DashboardLoadingSpinnerTwo size={60} />
        </div>
      ) : (
        series &&
        categories && (
          <div>
            <HorizontalBarChart
              series={series}
              xCategories={categories}
              error={error}
            />
          </div>
        )
      )}

      <div className="grid grid-cols-1 items-center justify-between border-t border-gray-200">
        <div className="flex items-center justify-between pt-5">
          {dropOptions && (
            <div className="relative flex cursor-pointer items-center justify-between">
              <button
                onClick={() => setIsDropOpen(true)}
                className="inline-flex items-center text-center text-sm font-medium text-dashboard-body"
                type="button"
              >
                {choices.find((choice) => choice.selected)?.option}
                <DownCaretOne />
              </button>

              {isDropOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute bottom-8 left-0 z-10 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow"
                >
                  <ul className="py-2 text-sm text-gray-700">
                    {choices.map((choice, index) => {
                      return (
                        <li
                          key={index}
                          onClick={() => handleDropOptionSelect(choice.option)}
                        >
                          <span className="block px-4 py-2 hover:bg-gray-100">
                            {choice.option}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

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
      </div>
    </div>
  );
}
