import { initialProjectList } from "@/projectData/homeProjectData";
import type { Member, Project } from "@/types/projectTypes";

export const PROJECTS_STORAGE_KEY = "devhacks.projects.v1";

export function loadProjectsFromStorage(): Project[] {
  if (typeof window === "undefined") return initialProjectList;
  const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!raw) return initialProjectList;

  try {
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) ? parsed : initialProjectList;
  } catch {
    return initialProjectList;
  }
}

export function saveProjectsToStorage(projects: Project[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function getTeammatesFromProjects(projects: Project[]): Member[] {
  return projects.flatMap((project) => project.members);
}
