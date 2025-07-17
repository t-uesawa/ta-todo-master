// 基本的な型定義
export interface User {
  uid: string;
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'manager' | 'member';
}

export interface Construction {
  uid: string;
  kojiCode: string;
  kojiBango: string;
  kojiFullName: string;
  kojiName: string;
  ankenNo: string;
  orderer: string;
  startDate: Date;
  endDate: Date;
  contractDate: Date;
  contractAmount: number;
  deliveryStatus: 0 | 1 | 2;
}

export interface Project {
  uid: string;
  kojiUid?: string;
  projectName: string;
  taskUids: string[];
  projectType: 'construction' | 'general';
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export interface Task {
  uid: string;
  projectUid: string;
  taskMasterUid?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  assigneeUid: string;
  dueDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export interface PhaseGroup {
  uid: string;
  parentGroupUid?: string;
  groupName: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export interface Phase {
  uid: string;
  parentGroupUid: string;
  phaseName: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export interface TaskMaster {
  uid: string;
  phaseUid: string;
  taskName: string;
  taskDescription?: string;
  memo?: string;
  primaryAssignee?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export interface TaskFilter {
  status?: 'not_started' | 'in_progress' | 'completed';
  assigneeUid?: string;
  projectUid?: string;
  freeText?: string;
}

export interface TreeNode {
  id: string;
  label: string;
  description?: string;
  children?: TreeNode[];
  type: MasterType;
  data?: PhaseGroup | Phase | TaskMaster;
}

export type MasterType = 'root' | 'group' | 'phase' | 'task';

export type IconButtonType = 'detail' | 'add' | 'edit' | 'delete' | null;

export type MasterDataResult =
  | { type: 'phaseGroup'; data: PhaseGroup }
  | { type: 'phase'; data: Phase }
  | { type: 'taskMaster'; data: TaskMaster }
  | { type: 'none'; data: null };