import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import {
  ROUTE_DASHBOARD_MAIN,
  ROUTE_DASHBOARD_HOME,
  ROUTE_DASHBOARD_CREATE_LP,
} from "~/configs/routes";
import DashboardDropdownWrap from "../Dashboard/DashboardDropdownWrap";
import { AddIcon, FolderIcon, HomeIcon } from "../Dashboard/Icons";

interface ProgramsDropdownProps {
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProgramsDropdown({
  setIsDropdownOpen,
}: ProgramsDropdownProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { address } = router.query;
  const loyaltyAddress = String(address);

  const { data: programs } =
    api.loyaltyPrograms.getAllProgramsBasicInfo.useQuery(
      {
        creatorId: session?.user.id ?? "",
      },
      { refetchOnWindowFocus: false },
    );
  const [activeProgram] =
    programs?.filter((program) => program.address === loyaltyAddress) ?? [];

  return (
    <DashboardDropdownWrap
      dropTitle="Loyalty Programs"
      secondTitle={activeProgram?.name ?? ""}
      secondTitleIcon={<HomeIcon size={16} color="currentColor" />}
      secondTitleRoute={
        loyaltyAddress
          ? ROUTE_DASHBOARD_HOME(loyaltyAddress)
          : ROUTE_DASHBOARD_MAIN
      }
      additionalAction={() => console.log("TODO finish this")}
      actionTitle="Create loyalty program"
      actionIcon={<AddIcon size={12} color="currentColor" />}
      setIsDropdownOpen={setIsDropdownOpen}
    >
      {programs?.map((program) => {
        return (
          <div key={program.id}>
            <Link href={ROUTE_DASHBOARD_HOME(program.address)}>
              <div className="focus:text-primary group flex cursor-pointer items-center gap-4 py-2 pl-4 pr-4 text-dashboardLight-secondary focus:bg-gray-50 focus:outline-none">
                <div className="size-4 text-dashboardLight-secondary">
                  <FolderIcon size={16} color="currentColor" />
                </div>
                <span className="flex-1 truncate text-sm">{program.name}</span>
                <span />
              </div>
            </Link>
          </div>
        );
      })}
    </DashboardDropdownWrap>
  );
}
