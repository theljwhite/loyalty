import { SPACE_BETWEEN_CAPITALS_REPLACE } from "~/constants/regularExpressions";

interface DashboardSummaryTableProps<T> {
  title: string;
  dataArr?: T[];
  dataObj?: Record<string, string>;
  arrProperty1?: (data: T) => string;
  arrProperty2?: (data: T) => string;
}

export default function DashboardSummaryTable<T>({
  title,
  dataArr,
  dataObj,
  arrProperty1,
  arrProperty2,
}: DashboardSummaryTableProps<T>) {
  return (
    <div className="mb-12 mt-4 rounded-lg border border-dashboard-menuInner bg-white">
      <h2 className="flex h-10 w-full items-center justify-between rounded-t-lg border border-b bg-dashboard-input pe-5 ps-5 text-sm font-semibold leading-[1.2] text-dashboard-heading">
        {title}
      </h2>
      <div style={{ scrollbarWidth: "none" }} className="max-h-[460px] p-5">
        <div className="flex flex-col break-words">
          <div className="relative w-full">
            {dataArr &&
              dataArr.map((data, index: number) => {
                return (
                  <div
                    key={index}
                    className="flex flex-row items-center gap-2 py-2"
                  >
                    <input
                      placeholder={arrProperty1 && arrProperty1(data)}
                      className="text-md relative h-10 w-full appearance-none rounded-md border-2 border-transparent bg-dashboard-input pe-4 ps-4 outline-none"
                      disabled={true}
                    />
                    <input
                      placeholder={arrProperty2 && arrProperty2(data)}
                      className="text-md relative h-10 w-full appearance-none rounded-md border-2 border-transparent bg-dashboard-input pe-4 ps-4 outline-none"
                      disabled={true}
                    />
                  </div>
                );
              })}
            {dataObj &&
              Object.entries(dataObj).map(([key, value]) => {
                return (
                  <div
                    key={key}
                    className="flex flex-row items-center gap-2 py-2"
                  >
                    <input
                      placeholder={SPACE_BETWEEN_CAPITALS_REPLACE(key)}
                      className="text-md relative h-10 w-full appearance-none rounded-md border-2 border-transparent bg-dashboard-input pe-4 ps-4 capitalize outline-none"
                      disabled={true}
                    />
                    <input
                      placeholder={value}
                      className="text-md relative h-10 w-full appearance-none rounded-md border-2 border-transparent bg-dashboard-input pe-4 ps-4 outline-none"
                      disabled={true}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
