import { DashboardLoadingSpinner } from "../Misc/Spinners";
import DashboardActionButton from "./DashboardActionButton";
import { FormErrorIcon } from "./Icons";

interface DashboardDataTableProps {
  data: any[];
  columnNames: string[];
  noDataTitle: string;
  noDataMessage: string;
  noDataIcon?: JSX.Element;
  noDataAction?: (...args: any[]) => any;
  noDataActionTitle?: string;
  dataLoading?: boolean;
  dataError?: string;
}

export default function DashboardDataTable({
  data,
  columnNames,
  noDataTitle,
  noDataMessage,
  noDataIcon,
  noDataAction,
  noDataActionTitle,
  dataLoading,
  dataError,
}: DashboardDataTableProps) {
  return (
    <div>
      <div>
        <section className="relative isolate flex flex-col overflow-hidden rounded-2xl bg-dashboardLight-body p-1">
          <div className="mt-[calc(0.25rem * -1)] relative isolate order-1">
            <div className="relative overflow-x-auto [overscroll-behavior-x:contain]">
              <table className="shadow-xs relative min-w-full table-fixed border-separate whitespace-nowrap">
                <thead>
                  <tr className="table-row text-sm text-dashboardLight-primary">
                    {columnNames.map((name, index) => {
                      return (
                        <th
                          className="overflow-hidden px-4 pb-2 pt-3 text-left text-xs font-semibold text-dashboardLight-primary"
                          key={index}
                        >
                          {name}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="relative">
                  {dataLoading ? (
                    <tr className="table-row">
                      <td
                        colSpan={7}
                        className="table-cell rounded-2xl border border-dashboard-primary bg-white bg-clip-padding p-4 text-left"
                      >
                        <div className="flex min-h-[20rem] flex-col items-center justify-center gap-2 p-12 text-center">
                          <DashboardLoadingSpinner size={40} />
                        </div>
                      </td>
                    </tr>
                  ) : dataError ? (
                    <tr className="table-row">
                      <td
                        colSpan={7}
                        className="table-cell rounded-2xl border border-dashboard-primary bg-white bg-clip-padding p-4 text-left"
                      >
                        <div className="flex min-h-[20rem] flex-col items-center justify-center gap-2 p-12 text-center">
                          <span className="order-1 pb-4">
                            <span className="h-5 h-5 shrink-0 overflow-visible text-error-1">
                              <FormErrorIcon size={34} color="currentColor" />
                            </span>
                          </span>

                          <span className="order-2 text-xl font-semibold text-dashboard-activeTab">
                            {noDataTitle}
                          </span>
                          <span className="order-3 text-base text-dashboard-body">
                            {dataError}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr className="table-row">
                      <td
                        colSpan={7}
                        className="table-cell rounded-2xl border border-dashboard-primary bg-white bg-clip-padding p-4 text-left"
                      >
                        <div className="flex min-h-[20rem] flex-col items-center justify-center gap-2 p-12 text-center">
                          {noDataIcon && (
                            <span className="order-1 pb-4">
                              <span className="h-5 h-5 shrink-0 overflow-visible text-dashboard-lighterText">
                                {noDataIcon}
                              </span>
                            </span>
                          )}
                          <span className="order-2 text-xl font-semibold text-dashboard-activeTab">
                            {noDataTitle}
                          </span>
                          <span className="order-3 text-base text-dashboard-body">
                            {noDataMessage}
                          </span>
                          {noDataAction && noDataActionTitle && (
                            <span className="order-4 pt-4">
                              <DashboardActionButton
                                btnText={noDataActionTitle}
                                btnType="button"
                                onClick={noDataAction}
                                isPrimary
                              />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      const values = Object.values(item);
                      return (
                        <tr key={index} className="group table-row">
                          {values.map((value, valIndex) => {
                            return (
                              <td
                                key={valIndex}
                                className="table-cell overflow-hidden bg-white bg-clip-padding p-4 text-left group-[:nth-of-type(3)_&]:rounded-2xl"
                              >
                                <span className="text-secondary text-base">
                                  {String(value)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
