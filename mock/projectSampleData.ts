import type { AppState, ID, Project, TasksByMember } from "@/types/projectTypes";

const memberTaskMap = (rows: Array<{ memberId: ID; tasks: TasksByMember[ID] }>): TasksByMember =>
  Object.fromEntries(rows.map((row) => [row.memberId, row.tasks]));

export const seedProjects: Project[] = [
  {
    id: "project-1",
    name: "PROJECT_1",
    members: [
      { id: "claudius", name: "Claudius Marco", position: "Team Lead" },
      { id: "john", name: "Johny Chauhari", position: "Frontend Developer" },
    ],
    checkpoints: [
      {
        id: "checkpoint-1",
        name: "Checkpoint 1",
        createdAt: "2026-02-20",
        tasksByMember: memberTaskMap([
          {
            memberId: "claudius",
            tasks: [
              {
                id: "task-1",
                text: "Finish the front-end of the app",
                dueDate: "20/Feb/26",
                completed: false,
              },
              {
                id: "task-2",
                text: "Create a design doc for the components",
                dueDate: "20/Feb/26",
                completed: false,
              },
            ],
          },
          {
            memberId: "john",
            tasks: [
              {
                id: "task-3",
                text: "Set up reusable page components",
                dueDate: "22/Feb/26",
                completed: true,
              },
              {
                id: "task-4",
                text: "Prepare styling pass for project cards",
                dueDate: "23/Feb/26",
                completed: false,
              },
            ],
          },
        ]),
      },
      {
        id: "checkpoint-2",
        name: "Checkpoint 2",
        createdAt: "2026-02-21",
        tasksByMember: memberTaskMap([
          {
            memberId: "claudius",
            tasks: [
              {
                id: "task-5",
                text: "Review all teammate task allocations",
                dueDate: "25/Feb/26",
                completed: false,
              },
            ],
          },
          {
            memberId: "john",
            tasks: [
              {
                id: "task-6",
                text: "Refine sidebar and modals behavior",
                dueDate: "25/Feb/26",
                completed: false,
              },
            ],
          },
        ]),
      },
    ],
  },
  {
    id: "project-2",
    name: "COMP-2280-A02-A03 - Introduction to Computer Systems",
    members: [
      { id: "amy", name: "Amy Stone", position: "Backend Developer" },
      { id: "kevin", name: "Kevin Pike", position: "QA Engineer" },
    ],
    checkpoints: [],
  },
];

export const initialAppState: AppState = {
  projectList: seedProjects,
  modalFlow: {
    newProjectOpen: false,
    captureOpen: false,
    captureStep: "chooseProject",
  },
  captureDraft: {
    projectId: "",
    checkpointName: "",
    recordingState: "idle",
  },
};
