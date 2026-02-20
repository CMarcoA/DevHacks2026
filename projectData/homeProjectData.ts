import { seedProjects } from "@/mock/projectSampleData";
import type { Member, Project } from "@/types/projectTypes";

export const initialProjectList: Project[] = seedProjects;

export const initialTeammateList: Member[] = seedProjects.flatMap(
  (project) => project.members
);
