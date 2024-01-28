interface DashboardInputBoxProps {
  title: string;
  description: string;
  placeholder?: string;
  stateVar: string;
  isValid: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => any;
}

export default function DashboardSingleInputBox({
  title,
  description,
  placeholder,
  stateVar,
  isValid,
  onChange,
}: DashboardInputBoxProps) {
  return (
    <div className="relative flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6">
      <div className="flex-start flex flex-row">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-md font-semibold capitalize leading-6">
              {title}
              <code className="bg-dashboard-badge text-dashboard-required ml-1 inline-flex items-center gap-1 whitespace-nowrap py-0.5 pe-1.5 ps-1.5 align-middle text-xs font-normal leading-[1.4]">
                Required
              </code>
            </p>
          </div>
          <p className="mb-6 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
            {description}
          </p>

          <div className="border-box">
            <p className="text-[13px] font-semibold leading-5 text-dashboard-body">
              Enter {title}
            </p>
            <div className="break-words">
              <div className="mt-2">
                <div className="mt-2 flex">
                  <div className="relative w-full">
                    <div className="flex justify-between"></div>
                    <div className="relative isolate flex w-full">
                      <input
                        value={stateVar}
                        onChange={onChange}
                        placeholder={placeholder ?? `Enter ${title}`}
                        className={`${
                          isValid && stateVar.length > 0
                            ? "focus:border-primary-1"
                            : "focus:border-error-1"
                        } relative h-8 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 pe-3 ps-3 text-[13px] font-normal outline-none`}
                      />
                    </div>
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
