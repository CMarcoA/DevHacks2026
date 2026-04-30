import { initialProjectList } from "@/projectData/homeProjectData";
import type { Member, Project } from "@/types/projectTypes";

export const PROJECTS_STORAGE_KEY = "devhacks.projects.v1";
const LEGACY_PROJECT_TITLE = "Project Raphael";
const UPDATED_PROJECT_TITLE = "Project DevHacks2026";
const NEW_PROJECT_TITLE = "DevHacks 2027";
const DEVHACKS_2027_CHECKPOINT_ID = "checkpoint-devhacks-2027-1";
const DEVHACKS_2027_CHECKPOINT_NAME = "Checkpoint 1 / Milestone 1 - Draft design document";

function getDevHacks2027TasksByMember(members: Project["members"]) {
  const robert = members.find(
    (member) => member.name.trim().toLowerCase() === "professor robert guderian"
  );
  const john = members.find(
    (member) => member.name.trim().toLowerCase() === "professor john smith"
  );

  return {
    ...(robert
      ? {
          [robert.id]: [
            {
              id: "task-devhacks-2027-1",
              text: "Create the design document in Microsoft Word",
              dueDate: null,
              completed: false,
            },
            {
              id: "task-devhacks-2027-2",
              text: "Make initial draft",
              dueDate: null,
              completed: false,
            },
          ],
        }
      : {}),
    ...(john
      ? {
          [john.id]: [
            {
              id: "task-devhacks-2027-3",
              text: "Finalise software architecture",
              dueDate: null,
              completed: false,
            },
            {
              id: "task-devhacks-2027-4",
              text: "Create a draft to present pipeline in next week's meeting",
              dueDate: null,
              completed: false,
            },
          ],
        }
      : {}),
  };
}

function normalizeProjectTitles(projects: Project[]): Project[] {
  return projects.map((project) =>
    project.name.trim().toLowerCase() === LEGACY_PROJECT_TITLE.toLowerCase()
      ? { ...project, name: UPDATED_PROJECT_TITLE }
      : project
  );
}

function ensureDevHacks2027Project(projects: Project[]): Project[] {
  const projectIndex = projects.findIndex(
    (project) => project.name.trim().toLowerCase() === NEW_PROJECT_TITLE.toLowerCase()
  );
  if (projectIndex >= 0) {
    const updatedProjects = [...projects];
    const existingProject = updatedProjects[projectIndex];
    const tasksByMember = getDevHacks2027TasksByMember(existingProject.members);
    const checkpointIndex = existingProject.checkpoints.findIndex(
      (checkpoint) =>
        checkpoint.id === DEVHACKS_2027_CHECKPOINT_ID ||
        checkpoint.name.trim().toLowerCase() === DEVHACKS_2027_CHECKPOINT_NAME.toLowerCase()
    );

    if (checkpointIndex >= 0) {
      const existingCheckpoint = existingProject.checkpoints[checkpointIndex];
      const updatedCheckpoint = {
        ...existingCheckpoint,
        tasksByMember: {
          ...existingCheckpoint.tasksByMember,
          ...tasksByMember,
        },
      };
      const updatedCheckpoints = [...existingProject.checkpoints];
      updatedCheckpoints[checkpointIndex] = updatedCheckpoint;
      updatedProjects[projectIndex] = { ...existingProject, checkpoints: updatedCheckpoints };
      return updatedProjects;
    }

    updatedProjects[projectIndex] = {
      ...existingProject,
      checkpoints: [
        {
          id: DEVHACKS_2027_CHECKPOINT_ID,
          name: DEVHACKS_2027_CHECKPOINT_NAME,
          createdAt: "2026-04-30",
          tasksByMember,
        },
        ...existingProject.checkpoints,
      ],
    };
    return updatedProjects;
  }

  return [
    {
      id: "project-devhacks-2027",
      name: NEW_PROJECT_TITLE,
      members: [
        { id: "prof-robert-guderian", name: "Professor Robert Guderian", position: "Professor" },
        { id: "prof-john-smith", name: "Professor John Smith", position: "Professor" },
      ],
      checkpoints: [
        {
          id: DEVHACKS_2027_CHECKPOINT_ID,
          name: DEVHACKS_2027_CHECKPOINT_NAME,
          createdAt: "2026-04-30",
          tasksByMember: {
            "prof-robert-guderian": [
              {
                id: "task-devhacks-2027-1",
                text: "Create the design document in Microsoft Word",
                dueDate: null,
                completed: false,
              },
              {
                id: "task-devhacks-2027-2",
                text: "Make initial draft",
                dueDate: null,
                completed: false,
              },
            ],
            "prof-john-smith": [
              {
                id: "task-devhacks-2027-3",
                text: "Finalise software architecture",
                dueDate: null,
                completed: false,
              },
              {
                id: "task-devhacks-2027-4",
                text: "Create a draft to present pipeline in next week's meeting",
                dueDate: null,
                completed: false,
              },
            ],
          },
        },
      ],
    },
    ...projects,
  ];
}

export function loadProjectsFromStorage(): Project[] {
  if (typeof window === "undefined") {
    return ensureDevHacks2027Project(normalizeProjectTitles(initialProjectList));
  }
  const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!raw) return ensureDevHacks2027Project(normalizeProjectTitles(initialProjectList));

  try {
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed)
      ? ensureDevHacks2027Project(normalizeProjectTitles(parsed))
      : ensureDevHacks2027Project(normalizeProjectTitles(initialProjectList));
  } catch {
    return ensureDevHacks2027Project(normalizeProjectTitles(initialProjectList));
  }
}

export function saveProjectsToStorage(projects: Project[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function getTeammatesFromProjects(projects: Project[]): Member[] {
  return projects.flatMap((project) => project.members);
}
