import React, { useState } from "react";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { useNextLoyaltyStep } from "~/customHooks/useNextLoyaltyStep/useNextLoyaltyStep";
import { AddIcon, RightChevron } from "../UI/Dashboard/Icons";
import { MAX_TIERS_LENGTH } from "~/constants/loyaltyConstants";
import CreateTiersEditor from "./CreateTiersEditor";
import CreateNextButton from "./CreateNextButton";
import { validationFuncs } from "~/utils/loyaltyValidation";
import {
  TrashcanDelete,
  EditPencil,
  FormErrorIcon,
  CheckboxCheck,
} from "../UI/Dashboard/Icons";
import Link from "next/link";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";

export default function CreateTiers() {
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const { tiers, setTiers, isSkippingTiers, setIsSkippingTiers, step, errors } =
    useDeployLoyaltyStore((state) => state);
  const [activeTier, setActiveTier] = useState<number>(tiers.length);

  const currentStepError = errors.find((error) => error.step === step);
  const tiersValidation = validationFuncs.get(step);
  const onNextStep = useNextLoyaltyStep([
    () => tiersValidation?.[0]?.validation(tiers, isSkippingTiers),
  ]);

  const editExistingTier = (id: number): void => {
    setActiveTier(id);
    setIsEditorOpen(true);
  };

  const openEditorNewTier = (): void => {
    setActiveTier(tiers.length);
    setIsEditorOpen(true);
  };

  const removeTier = (id: number): void => {
    const removed = tiers
      .filter((tier) => tier.id !== id)
      .map((tier, index) => ({ ...tier, id: index }));
    setTiers(removed);
  };

  return (
    <>
      <div
        className={`${
          isEditorOpen ? "justify-start" : "justify-between"
        } mb-6 flex flex-row items-center text-dashboard-heading`}
      >
        <div className="flex min-h-10 items-center">
          <nav className="block">
            <ol className="me-[1em]  list-decimal">
              <li className="inline-flex items-center">
                <span
                  onClick={() => setIsEditorOpen(false)}
                  className="cursor-pointer list-decimal items-center hover:underline"
                >
                  Tiers
                </span>
                {isEditorOpen && (
                  <span className="me-1 ms-1 text-dashboard-tooltip">
                    <RightChevron size={16} color="currentColor" />
                  </span>
                )}
              </li>
              {isEditorOpen && (
                <li className="inline-flex items-center">
                  <span className="cursor-pointer list-decimal items-center hover:underline">
                    New Tier
                  </span>
                </li>
              )}
            </ol>
          </nav>
        </div>
        {!isEditorOpen && (
          <button
            disabled={tiers.length >= MAX_TIERS_LENGTH}
            type="button"
            onClick={openEditorNewTier}
            className="inline-flex h-8 w-auto appearance-none items-center justify-center whitespace-nowrap rounded-md border border-primary-1 bg-transparent pe-3 ps-3 align-middle text-sm font-medium leading-[1.2] text-primary-1 outline-none outline-offset-2 hover:bg-violet-200 disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-dashboard-input disabled:text-gray-400"
          >
            <span className="me-2 inline-flex shrink-0 self-center leading-[1.2]">
              <AddIcon size={16} color="currentColor" />
            </span>
            Add Tier
          </button>
        )}
      </div>
      {isEditorOpen ? (
        <CreateTiersEditor
          setIsEditorOpen={setIsEditorOpen}
          activeTier={activeTier}
        />
      ) : (
        <div className="border-box block border-spacing-[2px] overflow-hidden rounded-lg border border-solid border-dashboard-input bg-white">
          <table
            role="table"
            className="indent-initial m-0 table w-full [transition:opacity_0.2s_ease-in-out_0s]"
          >
            <thead className="table-header-group border-collapse border-spacing-[2px] overflow-hidden break-words border-none align-middle">
              <tr
                className="table-row border-collapse overflow-hidden break-words border border-dashboard-divider bg-dashboard-input align-middle"
                role="row"
              >
                <th className="h-10 w-[40%] py-1  pe-4 ps-4 text-start text-xs font-semibold uppercase leading-4 text-dashboard-table1">
                  Tier Name
                </th>
                <th className="h-10 w-[30%] py-1 pe-4 ps-4 text-start text-xs font-semibold uppercase leading-4 text-dashboard-table1">
                  Points Required
                </th>
                <th className="h-10 w-[40%] py-1 pe-4 ps-4 text-start text-xs font-semibold uppercase leading-4 text-dashboard-table1">
                  Min Obj To Reach.
                </th>

                <th className="h-10 min-w-[30px] py-1 pe-4 ps-4 text-center text-xs font-semibold uppercase leading-4 text-dashboard-table1"></th>
                {/* border border-solid border-dashboard-menuInner  */}
              </tr>
            </thead>

            <tbody>
              {tiers.map((tier) => {
                return (
                  <tr
                    className="table-row border-collapse border-spacing-[2px] overflow-hidden break-words border border-dashboard-divider bg-white align-middle hover:bg-dashboard-input"
                    role="row"
                    key={tier.id}
                  >
                    <td
                      className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                      role="gridcell"
                    >
                      <div className="block py-4">
                        <div className="flex flex-row items-center">
                          <span className="ms-4 flex min-h-9 flex-col justify-center">
                            {tier.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td
                      className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                      role="gridcell"
                    >
                      <div className="block py-4">{tier.rewardsRequired}</div>
                    </td>
                    <td
                      className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                      role="gridcell"
                    >
                      <div className="block py-4">
                        {tier.minObjsToReach} objectives
                      </div>
                    </td>

                    <td
                      className="cursor-pointer py-0 pe-4 ps-4 text-center text-sm leading-4 "
                      role="gridcell"
                    >
                      <div className="flex flex-row gap-2 py-4 text-gray-400">
                        <span onClick={() => editExistingTier(tier.id)}>
                          <EditPencil size={16} color="currentColor" />
                        </span>
                        <span onClick={() => removeTier(tier.id)}>
                          <TrashcanDelete size={16} color="currentColor" />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {tiers.length == 0 && (
              <caption className="text-dashboard-table-1 text-md my-3 caption-bottom py-2 pe-4 ps-4 text-center font-medium">
                <div className="my-12 ">
                  <h1 className="text-md mb-2  font-semibold leading-[1.2] text-dashboard-heading">
                    Add a tier to get started
                  </h1>
                  <p className="text-sm">
                    Tier points required values must be added in ascending
                    order.{" "}
                    <Link href={ROUTE_DOCS_MAIN} className="text-primary-1">
                      Learn more
                    </Link>
                  </p>
                </div>
              </caption>
            )}
          </table>
        </div>
      )}

      {!isEditorOpen && (
        <div>
          <div className="py-3 pe-4 ps-4">
            <span className="text-dashboard-tooltip">
              Showing {tiers.length} tiers
            </span>
          </div>

          <div className="my-12 text-dashboard-menuText">
            <label className="relative inline-flex cursor-pointer items-center align-top">
              <input
                onChange={(e) => setIsSkippingTiers(e.target.checked)}
                type="checkbox"
                className="absolute m-[-1px] h-px w-px overflow-hidden whitespace-nowrap border-none"
              />
              <span
                className={`${
                  isSkippingTiers
                    ? "border-primary-1 bg-primary-2 hover:bg-primary-1"
                    : "bg-transparent"
                } inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 align-top text-white`}
              >
                {isSkippingTiers && (
                  <div className="flex h-full items-center justify-center">
                    <CheckboxCheck w={12} h={10} color="white" />
                  </div>
                )}
              </span>
              <span className="text-md ms-2 select-none">
                I choose not to use tiers. Skip adding tiers. Tiers cannot be
                added at a later date.
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-row items-center">
            <CreateNextButton step={step} onClick={onNextStep} />
            {currentStepError && (
              <span className="flex flex-row gap-1 truncate pl-4 font-medium text-error-1">
                <FormErrorIcon size={20} color="currentColor" />{" "}
                {currentStepError.message}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
