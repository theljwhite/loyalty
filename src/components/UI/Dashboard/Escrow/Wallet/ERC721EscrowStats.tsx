import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useEscrowContractRead } from "~/customHooks/useEscrowContractRead/useEscrowContractRead";
import { useDepositRewardsStore } from "~/customHooks/useDepositRewards/store";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import WalletStatsCard from "./WalletStatsCard";

export default function ERC721EscrowStats() {
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [rewardsInfo, setRewardsInfo] = useState<{
    name: string;
    symbol: string;
    address: string;
  }>({ name: "", symbol: "", address: "" });

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { isSuccess } = useDepositRewardsStore((state) => state);

  const { data } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );

  const { getERC721EscrowTokenIds, getRewardsRelatedEscrowStateVars } =
    useEscrowContractRead(data?.escrow?.address ?? "", "ERC721");

  useEffect(() => {
    fetchStatsFromContract();
  }, [isSuccess]);

  const fetchStatsFromContract = async (): Promise<void> => {
    const escrowTokenIds = await getERC721EscrowTokenIds();
    const escrowRewardsRelatedStateVars =
      await getRewardsRelatedEscrowStateVars();

    setTokenIds(escrowTokenIds);
    setRewardsInfo({
      name: escrowRewardsRelatedStateVars?.name ?? "",
      symbol: `$${escrowRewardsRelatedStateVars?.symbol}` ?? "",
      address:
        shortenEthereumAddress(
          escrowRewardsRelatedStateVars?.address ?? "",
          8,
          8,
        ) ?? "",
    });
  };

  return (
    <>
      <div className="my-8 flex flex-row items-stretch gap-3">
        <WalletStatsCard
          title="Token Ids in Escrow"
          info="Token Ids that are deposited to escrow"
          stat={tokenIds.join(",")}
        />
        <WalletStatsCard
          title="Deposit Period"
          info="Deposit period is active until"
          stat={
            `${data?.escrow?.depositEndDate?.toLocaleTimeString()} on ${data?.escrow?.depositEndDate?.toLocaleDateString()}` ??
            ""
          }
        />
      </div>
      <div className="my-8 flex flex-row items-stretch gap-3">
        {Object.entries(rewardsInfo).map(([key, value]) => {
          return (
            <div key={key}>
              <WalletStatsCard
                title={`Rewards collection ${key}`}
                info={`The ${key} of the collection that you are using for rewards`}
                stat={value}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
