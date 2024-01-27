import React, { useState } from "react";
import Link from "next/link";
import { useDeployLoyaltyStore } from "~/customHooks/useDeployLoyalty/store";
import { useNextLoyaltyStep } from "~/customHooks/useNextLoyaltyStep/useNextLoyaltyStep";
import { validationFuncs } from "~/utils/loyaltyValidation";
import {
  AddIcon,
  EditPencil,
  ThumbDots,
  RightChevron,
  TrashcanDelete,
  FormErrorIcon,
} from "../UI/Dashboard/Icons";
import CreateObjectiveEditor from "./CreateObjectiveEditor";
import CreateNextButton from "./CreateNextButton";
import { type Objective } from "~/customHooks/useDeployLoyalty/types";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { MAX_OBJECTIVES_LENGTH } from "~/constants/loyaltyConstants";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";

//TODO - small styling issue with the <tr>'s when dragging/dropping

export default function CreateObjectives() {
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const { objectives, setObjectives, errors, step } = useDeployLoyaltyStore(
    (state) => state,
  );
  const [activeObjective, setActiveObjective] = useState<number>(
    objectives.length,
  );

  const currentStepError = errors.find((error) => error.step === step);
  const objectivesValidation = validationFuncs.get(step);
  const onNextStep = useNextLoyaltyStep([
    () => objectivesValidation?.[1]?.validation(objectives),
  ]);

  const editExistingObjective = (id: number): void => {
    setActiveObjective(id);
    setIsEditorOpen(true);
  };

  const openEditorNewObjective = (): void => {
    setActiveObjective(objectives.length);
    setIsEditorOpen(true);
  };

  const removeObjective = (id: number): void => {
    const removed = objectives
      .filter((obj) => obj.id !== id)
      .map((obj, index) => ({ ...obj, id: index }));
    setObjectives(removed);
  };

  const handleObjectivesReorder = (result: DropResult): void => {
    if (!result.destination) return;

    const objectiveId: number = result.source.index;
    const listIndex: number = result.destination.index;

    if (objectiveId === listIndex) return;

    const reordered = [...objectives]
      .reduce(
        (
          prev: Objective[],
          curr: Objective,
          index: number,
          self: Objective[],
        ) => {
          if (objectiveId === listIndex) prev.push(curr);
          if (index === objectiveId) return prev;
          if (objectiveId < listIndex) prev.push(curr);
          if (index === listIndex) prev.push(self[objectiveId] as Objective);
          if (objectiveId > listIndex) prev.push(curr);
          return prev;
        },
        [],
      )
      .map((obj: Objective, index: number) => ({ ...obj, id: index }));
    setObjectives(reordered);
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
            disabled={objectives.length >= MAX_OBJECTIVES_LENGTH}
            type="button"
            onClick={openEditorNewObjective}
            className="inline-flex h-8 w-auto appearance-none items-center justify-center whitespace-nowrap rounded-md border border-primary-1 bg-transparent pe-3 ps-3 align-middle text-sm font-medium leading-[1.2] text-primary-1 outline-none outline-offset-2 hover:bg-violet-200 disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-dashboard-input disabled:text-gray-400"
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
          activeObjective={activeObjective}
          setIsEditorOpen={setIsEditorOpen}
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
                <th className="h-10 w-[80%] py-1  pe-4 ps-4 text-start text-xs font-semibold uppercase leading-4 text-dashboard-table1">
                  Title
                </th>
                <th className="h-10 min-w-[70px] py-1 pe-4 ps-4 text-end text-xs font-semibold uppercase leading-4 text-dashboard-table1">
                  Authority
                </th>
                <th className="h-10 min-w-[100px] py-1 pe-4 ps-4 text-start text-xs font-semibold uppercase leading-4 text-dashboard-table1">
                  Points
                </th>
                <th className="h-10 min-w-[50px] py-1 pe-4 ps-4 text-center text-xs font-semibold uppercase leading-4 text-dashboard-table1"></th>
                {/* border border-solid border-dashboard-menuInner  */}
              </tr>
            </thead>
            <DragDropContext onDragEnd={handleObjectivesReorder}>
              <Droppable droppableId="objectives">
                {(provided) => (
                  <tbody {...provided.droppableProps} ref={provided.innerRef}>
                    {objectives &&
                      objectives.map((obj) => {
                        return (
                          <Draggable
                            index={obj.id}
                            key={obj.id}
                            draggableId={`${obj.id}`}
                          >
                            {(provided) => (
                              <tr
                                className="table-row border-collapse border-spacing-[2px] overflow-hidden break-words border border-dashboard-divider bg-white align-middle hover:bg-dashboard-input"
                                role="row"
                                key={obj.id}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <td
                                  className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                                  role="gridcell"
                                >
                                  <div className="block py-4">
                                    <div className="flex flex-row items-center">
                                      <span
                                        {...provided.dragHandleProps}
                                        className="cursor-grab"
                                      >
                                        <ThumbDots size={16} />
                                      </span>
                                      <span className="ms-4 flex min-h-9 flex-col justify-center">
                                        {obj.title.length > 75
                                          ? `${obj.title.slice(0, 75)}...`
                                          : obj.title}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td
                                  className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                                  role="gridcell"
                                >
                                  <div className="block py-4">
                                    {obj.authority}
                                  </div>
                                </td>
                                <td
                                  className="cursor-pointer py-0 pe-4 ps-4 text-start text-sm leading-4 "
                                  role="gridcell"
                                >
                                  <div className="block py-4">{obj.reward}</div>
                                </td>
                                <td
                                  className="cursor-pointer py-0 pe-4 ps-4 text-center text-sm leading-4 "
                                  role="gridcell"
                                >
                                  <div className="flex flex-row gap-2 py-4 text-gray-400">
                                    <span
                                      onClick={() =>
                                        editExistingObjective(obj.id)
                                      }
                                    >
                                      <EditPencil
                                        size={16}
                                        color="currentColor"
                                      />
                                    </span>
                                    <span
                                      onClick={() => removeObjective(obj.id)}
                                    >
                                      <TrashcanDelete
                                        size={16}
                                        color="currentColor"
                                      />
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </DragDropContext>
            {objectives.length == 0 && (
              <caption className="text-dashboard-table-1 text-md my-3 caption-bottom py-2 pe-4 ps-4 text-center font-medium">
                <div className="my-12 ">
                  <h1 className="text-md mb-2  font-semibold leading-[1.2] text-dashboard-heading">
                    Add an objective to get started
                  </h1>
                  <p className="text-sm">
                    Specify the title, points earned for completion, and the
                    authority for completion
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
              Showing {objectives.length} objectives
            </span>
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
