import { useState, useEffect } from "react";
import { useEscrowContractRead } from "~/customHooks/useEscrowContractRead/useEscrowContractRead";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import DashboardActionButton from "../../DashboardActionButton";
import { DataTableSpinner } from "~/components/UI/Misc/Spinners";
import { type EscrowType } from "@prisma/client";

interface ReviewBalancesProps {
  escrowAddress: string;
  escrowType: EscrowType;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type ReviewNFTBalance = {
  id: string;
  value?: string;
};

export default function ReviewBalances({
  escrowAddress,
  escrowType,
  setIsOpen,
}: ReviewBalancesProps) {
  const [balance, setBalance] = useState<string>("");
  const [nftBalances, setNftBalances] = useState<ReviewNFTBalance[]>([]);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);

  const { getERC20EscrowBalance } = useEscrowContractRead(
    escrowAddress,
    "ERC20",
  );
  const { getERC721EscrowTokenIds } = useEscrowContractRead(
    escrowAddress,
    "ERC721",
  );
  const { getERC1155EscrowTokenDetails } = useEscrowContractRead(
    escrowAddress,
    "ERC1155",
  );

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async (): Promise<void> => {
    setBalanceLoading(true);
    if (escrowType === "ERC20") {
      const erc20Balance: string = await getERC20EscrowBalance();
      setBalance(erc20Balance);
    }
    if (escrowType === "ERC721") {
      const erc721Balance: string[] = await getERC721EscrowTokenIds();
      const formattedERC721Bal = erc721Balance.map((bal) => ({ id: bal }));
      setNftBalances(formattedERC721Bal);
    }
    if (escrowType === "ERC1155") {
      const escrowDetails = await getERC1155EscrowTokenDetails();
      const escrowTokens = escrowDetails?.tokens.map((tkn) => ({
        id: String(tkn.id),
        value: String(tkn.value),
      }));
      setNftBalances(escrowTokens ?? []);
    }
    setBalanceLoading(false);
  };

  return (
    <DashboardModalWrapper setIsModalOpen={setIsOpen}>
      <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
        <div className="flex items-center justify-between text-dashboard-activeTab">
          Your Escrow Contract Balance
        </div>
        <p className="mt-1 text-sm font-normal leading-5 text-dashboard-lightGray">
          Review your escrow contract&apos;s token balances
        </p>
      </header>
      <div className="flex-1 py-0 pe-6 ps-6">
        <div className="relative isolate flex w-full">
          <div className="flex w-full flex-row items-center">
            <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
              <div className="flex w-full justify-between">
                <div className="flex">
                  <p className="overflow-hidden truncate text-sm font-semibold capitalize leading-5 text-white">
                    Your {escrowType} Contract Balance
                  </p>
                </div>
                <div className="ml-auto flex gap-1"></div>
              </div>
              <div className="relative flex">
                <section className="relative flex w-full flex-col">
                  {balanceLoading ? (
                    <div className="my-2 flex min-h-14 w-full items-center justify-center">
                      <DataTableSpinner size={30} />
                    </div>
                  ) : (
                    <div className="flex max-h-[300px] w-full flex-row text-start">
                      <span className="pr-3" />
                      {escrowType === "ERC20" ? (
                        <span className="text-md text-dashboard-codeLightBlue">
                          {balance}
                        </span>
                      ) : escrowType === "ERC721" ? (
                        <span>
                          {nftBalances.map((nft) => {
                            return (
                              <span className="text-md text-orange-400">
                                {nft.id}
                              </span>
                            );
                          })}
                        </span>
                      ) : (
                        escrowType === "ERC1155" && (
                          <div>
                            {nftBalances.map((nft, index) => {
                              return (
                                <div key={index}>
                                  <span className="text-md text-dashboard-codeLightBlue">
                                    Token Id #{nft.id}:{" "}
                                    <span className="text-orange-400">
                                      {nft.value}
                                    </span>
                                  </span>
                                  <br />
                                </div>
                              );
                            })}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="mt-8 flex items-center justify-between py-0 pe-6 ps-6">
        <div className="flex w-full justify-between">
          <DashboardActionButton
            isPrimary={false}
            btnText="Close"
            onClick={() => setIsOpen(false)}
          />
          <DashboardActionButton
            isPrimary
            btnText="Continue"
            onClick={() => setIsOpen(false)}
          />
        </div>
      </footer>
    </DashboardModalWrapper>
  );
}
