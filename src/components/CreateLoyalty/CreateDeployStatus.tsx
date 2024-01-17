import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { dismissToast } from "../UI/Toast/Toast";
import { RightChevron } from "../UI/Dashboard/Icons";

//TODO - this useEffect may not be needed, can prob router push direct from...
//...useDeployLoyalty hook

export default function CreateDeployStatus() {
  const { name, isSuccess, deployLoyaltyData, reset } = useDeployLoyaltyStore();
  const router = useRouter();

  useEffect(() => {
    if (isSuccess && deployLoyaltyData) {
      dismissToast();
      reset();
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [deployLoyaltyData, isSuccess]);

  return (
    <>
      <div className="mb-6 flex flex-row items-center justify-between text-dashboard-heading">
        <div className="flex min-h-10 items-center">
          <nav className="block">
            <ol className="me-[1em]  list-decimal">
              <li className="inline-flex items-center">
                <span className="cursor-pointer list-decimal items-center hover:underline">
                  Deploy
                </span>

                <span className="me-1 ms-1 text-dashboard-tooltip">
                  <RightChevron size={16} color="currentColor" />
                </span>
              </li>

              <li className="inline-flex items-center">
                <span className="cursor-pointer list-decimal items-center hover:underline">
                  {name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-dashboard-heading">
        Your loyalty program is deploying
      </h1>
      <p className="my-4 pe-4 text-dashboard-menuText">
        Remain on this page while your smart contract deploys. You will be
        redirected to your loyalty program when your contract has finished
        deploying.
      </p>
      <div className="flex h-full w-full justify-start">
        <Image
          width={300}
          height={300}
          alt="gif of a smart contract"
          src="/utilityImages/blockchain.gif"
        />
      </div>
    </>
  );
}
