import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import {
  ROUTE_DASHBOARD_MAIN,
  ROUTE_DASHBOARD_HOME,
  ROUTE_DASHBOARD_CREATE_LP,
} from "~/configs/routes";
import DashboardDropdownWrap from "../DashboardDropdownWrap";
import { DashboardLoadingSpinner } from "../../Misc/Spinners";
import { AddIcon, FolderIcon, WalletIcon } from "../Icons";

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

  const is = true;

  const { data: programs, isLoading } =
    api.loyaltyPrograms.getAllProgramsBasicInfo.useQuery(
      {
        creatorId: session?.user.id ?? "",
      },
      { refetchOnWindowFocus: false },
    );
  const activeProgram = programs?.find(
    (program) => program.address === loyaltyAddress,
  );
  const recentPrograms = [...(programs ?? [])]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  return (
    <DashboardDropdownWrap
      dropTitle="Loyalty Programs"
      secondTitle={activeProgram?.name ?? ""}
      secondTitleIcon={<WalletIcon size={16} color="currentColor" />}
      secondTitleRoute={
        loyaltyAddress
          ? ROUTE_DASHBOARD_HOME(loyaltyAddress)
          : ROUTE_DASHBOARD_MAIN
      }
      additionalRoute={ROUTE_DASHBOARD_CREATE_LP}
      actionTitle="Create Loyalty Program"
      actionIcon={<AddIcon size={12} color="currentColor" />}
      setIsDropdownOpen={setIsDropdownOpen}
    >
      {isLoading ? (
        <div className="focus:text-primary group flex cursor-pointer items-center justify-center gap-4 py-2 pl-4 pr-4 text-dashboardLight-secondary focus:bg-gray-50 focus:outline-none">
          <DashboardLoadingSpinner size={16} />
        </div>
      ) : (
        recentPrograms.length > 0 &&
        recentPrograms.map((program) => {
          return (
            <div key={program.id}>
              <Link href={ROUTE_DASHBOARD_HOME(program.address)}>
                <div className="focus:text-primary group flex cursor-pointer items-center gap-4 py-2 pl-4 pr-4 text-dashboardLight-secondary focus:bg-gray-50 focus:outline-none">
                  <div className="size-4 text-dashboardLight-secondary">
                    <FolderIcon size={16} color="currentColor" />
                  </div>
                  <span className="flex-1 truncate text-sm">
                    {program.name}
                  </span>
                  <span />
                </div>
              </Link>
            </div>
          );
        })
      )}
    </DashboardDropdownWrap>
  );
}
