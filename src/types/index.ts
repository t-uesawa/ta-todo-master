import { z } from "zod";

// スキーマ定義
const stringOrNull = z.union([z.string(), z.null()]);
export const employmentTypeSchema = z.enum(['役員', '正社員', '契約社員', '派遣社員', 'アルバイト']);
export const jobTitleSchema = z.enum(['役員', '部長', '課長', '一般']);
export const permissionSchema = z.enum(['admin', 'internalAdmin', 'internalUser', 'external']);
export const companySchema = z.enum(['大陽開発', '長倉工易']);

// 取得時のスキーマ(*)
export const EmployeeSchema = z.object({
  id: z.number(),	// serial (primary)
  uid: z.string(),	// firebase uid (unique) *
  employee_id: z.number(),	// 社員番号 (unique) *
  full_name: z.string(),	// 社員名 *
  family_name: stringOrNull,	// 苗字
  first_name: stringOrNull,	// 名前
  h_family_name: stringOrNull,	// 苗字(カナ)
  h_first_name: stringOrNull,	// 名前(カナ)
  parent_organization: z.string(),	// 親組織
  child_organization: z.string(),	// 子組織
  phone_number: stringOrNull,	// 電話番号
  birthdate: stringOrNull,	// 生年月日
  joining_date: stringOrNull,	// 入社年月日
  paid_leave_starting_date: stringOrNull,// 有休起算日
  retirement_date: stringOrNull,	// 退職年月日
  affiliation_company: companySchema, // 所属会社
  employment_type: employmentTypeSchema,	// 雇用区分
  job_title: jobTitleSchema,	// 役職
  permission: permissionSchema,	// 権限
  range_report_target: z.boolean(),	// 通勤距離報告対象者
  created_at: z.string(),	// 作成日時
  updated_at: z.string(),	// 更新日時
});

// 型を作成
export type Employee = z.infer<typeof EmployeeSchema>;

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
  representativeUid: string;
  assistantUid: string;
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