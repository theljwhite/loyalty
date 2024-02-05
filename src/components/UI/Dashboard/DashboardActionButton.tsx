import Link from "next/link";

interface DashboardActionButtonProps {
  btnText: string;
  btnType?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler;
  isPrimary: boolean;
  linkPath?: string;
}

export default function DashboardActionButton({
  btnText,
  btnType,
  onClick,
  isPrimary,
  linkPath,
}: DashboardActionButtonProps) {
  if (isPrimary) {
    return (
      <button
        type={btnType}
        onClick={onClick}
        className="relative ms-4 inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-white"
      >
        {btnText}
      </button>
    );
  }

  return (
    <>
      {linkPath ? (
        <Link
          href={linkPath}
          className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
        >
          {btnText}
        </Link>
      ) : (
        <button
          type={btnType}
          onClick={onClick}
          className="relative inline-flex h-10 w-auto min-w-10 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-dashboard-input pe-4 ps-4 align-middle align-middle font-semibold leading-[1.2] text-dashboard-menuText"
        >
          {btnText}
        </button>
      )}
    </>
  );
}
