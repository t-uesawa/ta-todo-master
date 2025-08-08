// 基本的な型定義
export interface User {
  uid: string;
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'manager' | 'member';
}

// 工事
export interface Construction {
  id: string;	// uid
  code: string;	// 5桁の工事番号
  label: string;	// 工事名(略称)
  fullLabel: string;	// 工事名
  start: string;	// 工事開始日
  end: string;	// 竣工日
  locations?: { lng: number, lat: number }[];	// 位置情報(緯度経度)
  caseNumber?: string;	// 4桁案件番号
  client?: string;	// 発注者名
  completionFlag?: string;	// 1:未完成, 2:社内完成, 3:引渡し済み
  contractAmount?: string;	// 契約金額
  contractDate?: string;	// 契約日(YYYY-MM-DD)
  displayFlag: boolean;	// 表示フラグ
}

// プロジェクト
export interface Project {
  uid: string;
  kojiUid?: string;
  projectName: string;
  tasks: Task[];
  projectType: 'construction' | 'general';
  memo: string;
  isCompleted: boolean;
  lock?: { uid: string, time: string };
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  deletedBy: string;
  deletedAt: string;
}

export interface Task {
  uid: string;  // {project.uid}(20桁)-{uuid}(20桁)
  projectUid: string;
  taskMasterUid: string;
  taskName: string;
  status: 'not_started' | 'in_progress' | 'completed';
  assigneeUid: string;
  dueDate: string;
  memo: string,
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  deletedBy: string;
  deletedAt: string;
}

export interface PhaseGroup {
  uid: string;
  parentGroupUid?: string;
  groupName: string;
  memo?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  deletedBy: string;
  deletedAt: string;
}

export interface Phase {
  uid: string;
  parentGroupUid: string;
  phaseName: string;
  memo?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  deletedBy: string;
  deletedAt: string;
}

export interface TaskMaster {
  uid: string;
  phaseUid: string;
  taskName: string;
  taskDescription: string;
  memo?: string;
  primaryAssignee?: string; // 主要担当者
  attachments?: string[]; // 添付ファイル
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  deletedBy: string;
  deletedAt: string;
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

export const COLLECTION_NAMES = {
  PROJECTS: 'Todo-Projects',
  TASKS: 'Todo-Tasks',
  PHASE_GROUPS: 'Todo-PhaseGroup',
  PHASES: 'Todo-Phase',
  TASK_MASTERS: 'Todo-TaskMasters'
}