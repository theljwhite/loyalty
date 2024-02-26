interface DashboardInputProps {
  id?: string;
  stateVar: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disableCondition: boolean;
  isValid: boolean;
  disableCorrection?: boolean;
}
export default function DashboardInput({
  id,
  stateVar,
  onChange,
  placeholder,
  disableCondition,
  isValid,
  disableCorrection,
}: DashboardInputProps) {
  return (
    <input
      disabled={disableCondition}
      {...(id && { id: id })}
      value={stateVar}
      onChange={onChange}
      placeholder={placeholder}
      className={`${
        isValid ? "focus:border-primary-1" : "focus:border-error-1"
      } relative h-8 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 pe-3 ps-3 text-[13px] font-normal outline-none disabled:cursor-not-allowed disabled:bg-stone-200`}
      {...(disableCorrection && {
        spellCheck: "false",
        autoCorrect: "off",
        autoComplete: "off",
      })}
    />
  );
}
