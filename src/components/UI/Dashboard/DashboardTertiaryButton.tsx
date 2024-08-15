import Image from "next/image";
import { MovingArrow } from "./Icons";

interface DashboardTertiaryButtonProps {
  onClick: React.MouseEventHandler;
  title: string;
  imageSrc?: string;
  icon?: JSX.Element;
  withArrowIcon: boolean;
}

export default function DashboardTertiaryButton({
  onClick,
  title,
  imageSrc,
  icon,
  withArrowIcon,
}: DashboardTertiaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative m-0 inline-flex min-h-[2.25rem] w-full cursor-pointer items-center justify-start gap-4 truncate rounded-md border border-solid border-[rgba(0,0,0,0.08)] bg-[unset] px-5 py-2.5 text-sm font-normal leading-none tracking-[0.5px] text-black outline-none duration-100 [transition-property:background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform] hover:bg-neutral-2"
    >
      <span className=" flex flex-[0_0_1.25rem] flex-row flex-nowrap items-center justify-center">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={`${title} image`}
            className="h-auto w-4 max-w-full"
            width={20}
            height={20}
          />
        )}
        {icon && icon}
      </span>
      <div className="flex w-full w-full flex-row flex-nowrap items-center justify-center gap-2 overflow-hidden">
        <span className="truncate text-sm font-normal leading-5 tracking-tight text-black">
          {title}
        </span>
      </div>
      {withArrowIcon && <MovingArrow size="20" />}
    </button>
  );
}
