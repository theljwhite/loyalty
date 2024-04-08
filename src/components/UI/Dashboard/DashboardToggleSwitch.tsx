import DashboardPopoverInfo from "./DashboardPopoverInfo";

interface DashboardToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => any;
  disableCheckbox?: boolean;
  disableCheckboxTip?: string;
}

export default function DashboardToggleSwitch({
  id,
  checked,
  onChange,
  disableCheckbox,
  disableCheckboxTip,
}: DashboardToggleSwitchProps) {
  const checkedCircleClass =
    "translate-x-[calc(3rem-1.5rem)] duration-200 bg-primary-1 border-white [box-shadow:0px_2px_8px_0px_#00000033]";
  const uncheckedCircleClass = "duration-200 bg-white border-dashboard-border1";

  const checkedSliderBg = "bg-primary-1/20";
  const uncheckedSliderBg = "bg-neutral-4";

  return (
    <div className="parent group relative">
      <label className="leading-0 relative inline-block align-middle">
        <input
          id={`checkbox-${id}`}
          onChange={onChange}
          type="checkbox"
          checked={checked}
          disabled={disableCheckbox}
          className="absolute -m-px h-px w-px appearance-none overflow-hidden whitespace-nowrap"
        />
        <span
          className={`${checked ? checkedSliderBg : uncheckedSliderBg} ${
            disableCheckbox ? "cursor-not-allowed" : "cursor-pointer"
          } content-box flex h-4 w-12 items-center justify-start rounded-full`}
        >
          <span
            className={`${
              checked ? checkedCircleClass : uncheckedCircleClass
            } h-6 w-6 rounded-full border-[0.125rem]`}
          ></span>
        </span>
      </label>
      {disableCheckbox && checked && disableCheckboxTip && (
        <DashboardPopoverInfo text={disableCheckboxTip} />
      )}
    </div>
  );
}
