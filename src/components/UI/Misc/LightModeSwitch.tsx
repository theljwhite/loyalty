import { MoonOne, SunOne } from "../Dashboard/Icons";

interface LightModeSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => any;
}

export default function LightModeSwitch({
  checked,
  onChange,
}: LightModeSwitchProps) {
  const checkedCircleClass =
    "translate-x-[calc(3rem-1.5rem)] duration-200 text-orange-400 bg-dashboardLight-primary border-white [box-shadow:0px_2px_8px_0px_#00000033]";
  const uncheckedCircleClass =
    "duration-200 text-primary-1 bg-white border-dashboard-border1";
  const checkedSliderBg = "bg-dashboard-codeSlate";
  const uncheckedSliderBg = "bg-neutral-4";

  return (
    <div className="parent group relative">
      <label className="leading-0 relative inline-block align-middle">
        <input
          onChange={onChange}
          type="checkbox"
          checked={checked}
          className="absolute -m-px h-px w-px appearance-none overflow-hidden whitespace-nowrap"
        />

        <span
          className={`${
            checked ? checkedSliderBg : uncheckedSliderBg
          } content-box flex h-4 w-12 cursor-pointer items-center justify-between rounded-full`}
        >
          <span
            className={`${
              checked ? checkedCircleClass : uncheckedCircleClass
            } h-6 w-6 rounded-full border-[0.125rem]`}
          >
            {checked ? (
              <SunOne size={20} color="currentColor" />
            ) : (
              <MoonOne size={20} color="currentColor" />
            )}
          </span>
        </span>
      </label>
    </div>
  );
}
