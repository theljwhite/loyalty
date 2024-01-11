import React, { useState } from "react";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { validationFuncs } from "~/utils/loyaltyValidation";
import { AddIcon, EditPencil, ThumbDots } from "../UI/Dashboard/Icons";
import CreateObjectiveEditor from "./CreateObjectiveEditor";
import { RightChevron, TrashcanDelete } from "../UI/Dashboard/Icons";

export type ObjectiveInput = {
  id: number;
  title: string;
  points: number;
  authority: "USER" | "CREATOR";
};

export default function CreateObjectives() {
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [objectivesInput, setObjectivesInput] = useState<ObjectiveInput[]>([
    {
      id: 0,
      title: "My first objective goes here",
      authority: "CREATOR",
      points: 200,
    },
  ]);
  const [objectiveId, setObjectiveId] = useState<number>(
    objectivesInput.length,
  );

  const { objectives, setObjectives, errors, step } = useDeployLoyaltyStore();
  const currentStepError = errors.find((error) => error.step === step);

  const objectivesValidation = validationFuncs.get(step);

  const editExistingObjective = (id: number): void => {
    setObjectiveId(id);
    setIsEditorOpen(true);
  };

  const addNewObjective = (): void => {
    setObjectiveId(objectivesInput.length);
    setIsEditorOpen(true);
  };

  const removeObjective = (id: number): void => {
    const removed = objectivesInput.filter((obj) => obj.id !== id);
    setObjectivesInput(removed);
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
                  Objectives
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
                    New Objective
                  </span>
                </li>
              )}
            </ol>
          </nav>
        </div>
        {!isEditorOpen && (
          <button
            type="button"
            onClick={addNewObjective}
            className="inline-flex h-8 w-auto appearance-none items-center justify-center whitespace-nowrap rounded-md border border-primary-1 bg-transparent pe-3 ps-3 align-middle text-sm font-medium leading-[1.2] text-primary-1 outline-none outline-offset-2 hover:bg-violet-200"
          >
            <span className="me-2 inline-flex shrink-0 self-center leading-[1.2]">
              <AddIcon size={16} color="currentColor" />
            </span>
            Add Objective
          </button>
        )}
      </div>
      {isEditorOpen ? (
        <CreateObjectiveEditor
          objectiveId={objectiveId}
          setIsEditorOpen={setIsEditorOpen}
          objectivesInput={objectivesInput}
          setObjectivesInput={setObjectivesInput}
        />
      ) : (
        <div className="border-box block border-spacing-[2px] overflow-hidden rounded-lg border border-solid border-dashboard-input bg-white">
          <table
            role="table"
            className="indent-initial  m-0 table w-full [transition:opacity_0.2s_ease-in-out_0s]"
          >
            <thead className="table-header-group border-collapse border-spacing-[2px] overflow-hidden break-words border-none align-middle">
              <tr
                className="table-row border-collapse break-words bg-dashboard-input align-middle"
                role="row"
              >
                <th className="text-dashboard-table1 h-10 w-[80%]  py-1 pe-4 ps-4 text-start text-xs font-semibold uppercase leading-4">
                  Title
                </th>
                <th className="text-dashboard-table1 h-10 min-w-[70px] py-1 pe-4 ps-4 text-end text-xs font-semibold uppercase leading-4">
                  Authority
                </th>
                <th className="text-dashboard-table1 h-10 min-w-[100px] py-1 pe-4 ps-4 text-start text-xs font-semibold uppercase leading-4">
                  Points
                </th>
                <th className="text-dashboard-table1 h-10 min-w-[50px] py-1 pe-4 ps-4 text-center text-xs font-semibold uppercase leading-4"></th>
                {/* border border-solid border-dashboard-menuInner  */}
              </tr>
            </thead>
            <tbody>
              {objectivesInput.map((obj) => {
                return (
                  <tr
                    className="table-row border-collapse break-words bg-white align-middle"
                    role="row"
                    key={obj.id}
                  >
                    <td
                      className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                      role="gridcell"
                    >
                      <div className="block py-4">
                        <div className="flex flex-row items-center">
                          <ThumbDots size={16} />
                          <span className="ms-4 flex min-h-9 flex-col justify-center">
                            {obj.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td
                      className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                      role="gridcell"
                    >
                      <div className="block py-4">{obj.authority}</div>
                    </td>
                    <td
                      className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                      role="gridcell"
                    >
                      <div className="block py-4">{obj.points}</div>
                    </td>
                    <td
                      className="cursor-pointer py-0 pe-4 ps-4 text-center text-sm leading-4 "
                      role="gridcell"
                    >
                      <div className="flex flex-row gap-2 py-4 text-gray-400">
                        <span onClick={() => editExistingObjective(obj.id)}>
                          <EditPencil size={16} color="currentColor" />
                        </span>
                        <span onClick={() => removeObjective(obj.id)}>
                          <TrashcanDelete size={16} color="currentColor" />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <caption></caption>
          </table>
        </div>
      )}
    </>
  );
}
