interface DashboardDataActionDisplayProps {
  dataTitle: string;
  data: any;
  dataActions: {
    title: string;
    handler: (...args: any[]) => any;
    disabled?: boolean;
  }[];
}

export default function DashboardDataActionDisplay({
  dataTitle,
  data,
  dataActions,
}: DashboardDataActionDisplayProps) {
  return (
    <>
      <dt className="border-primary rounded-l-md border border-r-0 bg-dashboardLight-body py-1 pl-2 pr-2.5 font-medium">
        {dataTitle}
      </dt>
      <dd className="flex gap-2.5">
        <div className="border-primary flex min-w-0 flex-1 items-center rounded-r-md border border-l-0 bg-dashboardLight-body pr-2">
          <span className="truncate text-dashboard-secondary">{data}</span>
        </div>
        {dataActions.map((action, index) => {
          return (
            <button
              key={`${action.title}-${index}`}
              type="button"
              onClick={action.handler}
              disabled={action.disabled}
              className="hover:text-primary initial:text-dashboard-lighterText focus-visible:text-primary before:opacity-2 before:to-gray-90 relative grid flex-none place-content-center rounded-md border border-black/10 px-1 py-0.5 text-xs font-medium shadow-sm outline-none transition-colors before:pointer-events-none before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-b before:from-transparent hover:bg-gray-100 focus-visible:ring-1 focus-visible:ring-black/10 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-gray-400"
            >
              {action.title}
            </button>
          );
        })}
      </dd>
    </>
  );
}
