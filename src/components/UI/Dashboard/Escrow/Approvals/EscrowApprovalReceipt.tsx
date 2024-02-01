import Image from "next/image";
import { RightChevron } from "../../Icons";

export default function EscrowApprovalReceipt() {
  return (
    <>
      <div className="mb-6 flex flex-row items-center justify-between text-dashboard-heading">
        <div className="flex min-h-10 items-center">
          <nav className="block">
            <ol className="me-[1em]  list-decimal">
              <li className="inline-flex items-center">
                <span className="cursor-pointer list-decimal items-center hover:underline">
                  Approvals
                </span>

                <span className="me-1 ms-1 text-dashboard-tooltip">
                  <RightChevron size={16} color="currentColor" />
                </span>
              </li>

              <li className="inline-flex items-center">
                <span className="cursor-pointer list-decimal items-center hover:underline">
                  Write to Contract
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-dashboard-heading">
          Writing your info to your contract
        </h1>
        <p className="my-4 pe-4 text-dashboard-menuText">
          Remain on this page while your sender address and rewards contract
          address are written to your escrow contract. After it is finished, you
          can begin your deposit period any time at your discretion.
        </p>
        <div className="flex h-full w-full justify-start">
          <Image
            width={300}
            height={300}
            alt="gif of a smart contract"
            src="/utilityImages/blockchain.gif"
          />
        </div>

        <div className="flex h-full w-full justify-start"></div>
      </div>
    </>
  );
}
