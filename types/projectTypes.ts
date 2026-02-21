export type ID = string;

export type Member = {
  id: string;
  name: string;
  position: string;
};

export type Task = {
  id: string;
  text: string;
  dueDate: string | null;
  completed: boolean;
};

export type TasksByMember = Record<ID, Task[]>;

export type Checkpoint = {
  id: string;
  name: string;
  createdAt: string;
  tasksByMember: TasksByMember;
  outputFile?: string | null;
};

export type Project = {
  id: string;
  name: string;
  members: Member[];
  checkpoints: Checkpoint[];
};

export type NewMemberInput = {
  name: string;
  position: string;
};

export type NewProjectInput = {
  name: string;
  members: NewMemberInput[];
};

export type CaptureDraft = {
  projectId: ID;
  checkpointName: string;
  recordingState: "idle" | "recording" | "stopped";
};

export type ModalFlow = {
  newProjectOpen: boolean;
  captureOpen: boolean;
  captureStep: "chooseProject" | "recordVoice" | "transcribing";
};

export type AppState = {
  projectList: Project[];
  modalFlow: ModalFlow;
  captureDraft: CaptureDraft;
};
