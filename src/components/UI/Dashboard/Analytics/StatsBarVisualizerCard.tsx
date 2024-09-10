import { useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import { getStartDateFromDropOption } from "~/constants/timeAndDate";
import { ChartType } from "~/server/api/routers/events";
import useOnClickOutside from "~/helpers/windowEvents";
import BarChart, { type BarChartSeries } from "./BarChart";
import { DashboardLoadingSpinnerTwo } from "../../Misc/Spinners";
import { CaretOne, DownCaretOne, PercentArrow } from "../Icons";
import { XTitleYData } from "~/utils/programAnalytics";

//TODO - logic for displaying percent change
//TODO - the useEffect in here can be prevented by conditionally checking for data in...
//...wherever this component is rendered, but loading UI will have to be moved.

interface StatsBarVisualizerProps {
  mainStat: string;
  description: string;
  percentChange?: number;
  dropOptions?: string[];
  defaultDropChoice?: string;
  fullReportPath?: string;
  data: BarChartSeries;
  dataLoading?: boolean;
  loyaltyAddress?: string;
  chartType?: ChartType;
}

export default function StatsBarVisualizerCard({
  mainStat,
  description,
  percentChange,
  dropOptions,
  defaultDropChoice,
  fullReportPath,
  data,
  dataLoading,
  loyaltyAddress,
  chartType,
}: StatsBarVisualizerProps) {
  const dropChoices = dropOptions?.map((option) => ({
    option,
    selected: option === defaultDropChoice,
  }));

  const [isDropOpen, setIsDropOpen] = useState<boolean>(false);
  const [choices, setChoices] = useState<
    { option: string; selected: boolean }[]
  >(dropChoices ?? []);

  const [statistic, setStatistic] = useState<string>("");
  const [series, setSeries] = useState<BarChartSeries>(data);
  const [error, setError] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(dropdownRef, () => setIsDropOpen(false));

  const { isLoading: refetchLoading, mutateAsync: getEventsInRange } =
    api.events.getEventsForChart.useMutation();

  const handleDropOptionSelect = async (option: string): Promise<void> => {
    handleChoiceState(option);
    try {
      const selection = getStartDateFromDropOption(option);

      if (!selection || !chartType) throw new Error();

      const result = (await getEventsInRange({
        startDate: selection,
        endDate: new Date(),
        loyaltyAddress: loyaltyAddress ?? "",
        chartType: chartType as ChartType,
      })) as XTitleYData[] | undefined;

      if (!result) throw new Error();

      const onlyY = result.map((item: XTitleYData) => item.y);

      const mainStat = onlyY.reduce(
        (prev: number, curr: number) => prev + curr,
        0,
      );
      setSeries(
        result.length > 0
          ? [
              {
                name: description,
                color: "#5639CC",
                data: result,
              },
            ]
          : [],
      );
      setStatistic(String(mainStat));
    } catch (error) {
      setError("Failed to fetch data. Try again later.");
    }
  };

  const handleChoiceState = (option: string): void => {
    setIsDropOpen(false);
    const selectedChoice = choices.map((choice) => ({
      ...choice,
      selected: choice.option === option,
    }));
    setChoices(selectedChoice);
  };

  useEffect(() => {
    if (data && data.length > 0 && !dataLoading) {
      setSeries(data);
    }
  }, [data, dataLoading]);

  return (
    <div className="w-full rounded-2xl border border-dashboard-border1 p-4 md:p-6">
      <div className="flex justify-between">
        <div>
          <h5 className="pb-2 text-3xl font-bold leading-none text-gray-800">
            {dataLoading || refetchLoading ? (
              <DashboardLoadingSpinnerTwo size={20} />
            ) : statistic ? (
              statistic
            ) : (
              mainStat
            )}
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
      {data && (
        <div id="data-series-chart">
          {dataLoading || refetchLoading ? (
            <div className="flex min-h-[175px] items-center justify-center">
              <DashboardLoadingSpinnerTwo size={60} />
            </div>
          ) : (
            series && <BarChart series={series} error={error} />
          )}
        </div>
      )}
      <div className="mt-5 grid grid-cols-1 items-center justify-between border-t border-dashboard-border1">
        {dropOptions && (
          <div className="relative flex cursor-pointer items-center justify-between pt-5">
            <button
              onClick={() => setIsDropOpen(true)}
              id="dropdownDefaultButton"
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
                <ul
                  className="py-2 text-sm text-gray-700"
                  aria-labelledby="dropdownDefaultButton"
                >
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
