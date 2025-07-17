import { User, Construction, Project, Task, PhaseGroup, Phase, TaskMaster } from '../types';

// ユーザーマスタ
export const mockUsers: User[] = [
  { uid: 'user1', name: '田中太郎', email: 'tanaka@example.com', department: '建設部', role: 'admin' },
  { uid: 'user2', name: '佐藤花子', email: 'sato@example.com', department: '設計部', role: 'manager' },
  { uid: 'user3', name: '鈴木一郎', email: 'suzuki@example.com', department: '営業部', role: 'member' },
  { uid: 'user4', name: '高橋美咲', email: 'takahashi@example.com', department: '建設部', role: 'member' },
  { uid: 'user5', name: '伊藤健太', email: 'ito@example.com', department: '設計部', role: 'member' }
];

// 工事マスタ
export const mockConstructions: Construction[] = [
  {
    uid: 'koji1',
    kojiCode: 'K2024001',
    kojiBango: '2024-001',
    kojiFullName: '東京都○○区庁舎建設工事',
    kojiName: '○○区庁舎建設',
    ankenNo: 'A2024001',
    orderer: '東京都○○区',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    contractDate: new Date('2024-03-15'),
    contractAmount: 500000000,
    deliveryStatus: 1
  },
  {
    uid: 'koji2',
    kojiCode: 'K2024002',
    kojiBango: '2024-002',
    kojiFullName: '横浜市公民館改修工事',
    kojiName: '公民館改修',
    ankenNo: 'A2024002',
    orderer: '横浜市',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-12-31'),
    contractDate: new Date('2024-04-15'),
    contractAmount: 150000000,
    deliveryStatus: 0
  },
  {
    uid: 'koji3',
    kojiCode: '24240',
    kojiBango: '河川巡視第1401-00-00-90号',
    kojiFullName: '一級河川保倉川他 社会資本点検費(ゼロ県)河川巡視委託',
    kojiName: '保倉川他河川巡視委託(R6)',
    ankenNo: '5632',
    orderer: '上越東維持管理事務所',
    startDate: new Date('2025-03-17'),
    endDate: new Date('2026-01-09'),
    contractDate: new Date('2025-03-17'),
    contractAmount: 1316700,
    deliveryStatus: 1
  }
];

// フェーズグループマスタ
export const mockPhaseGroups: PhaseGroup[] = [
  { uid: 'pg-1', groupName: '国土交通省グループ', parentGroupUid: undefined, createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'pg-2', groupName: '地方自治体グループ', parentGroupUid: undefined, createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'pg-3', groupName: '民間企業グループ', parentGroupUid: undefined, createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') }
];

// フェーズマスタ
export const mockPhases: Phase[] = [
  { uid: 'p-1', parentGroupUid: 'pg-1', phaseName: '着工前', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'p-2', parentGroupUid: 'pg-1', phaseName: '着工中', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'p-3', parentGroupUid: 'pg-1', phaseName: '竣工後', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'p-4', parentGroupUid: 'pg-2', phaseName: '計画段階', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'p-5', parentGroupUid: 'pg-2', phaseName: '実行段階', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'p-6', parentGroupUid: 'pg-2', phaseName: '完了段階', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') }
];

// タスクマスタ
export const mockTaskMasters: TaskMaster[] = [
  { uid: 'tm-1', phaseUid: 'p-1', taskName: 'A書類', taskDescription: '工事開始前に提出が必要な書類', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'tm-2', phaseUid: 'p-1', taskName: 'B書類', taskDescription: '安全管理に関する書類', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'tm-3', phaseUid: 'p-1', taskName: 'C書類', taskDescription: '環境影響評価書類', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'tm-4', phaseUid: 'p-2', taskName: '進捗報告書', taskDescription: '月次の進捗報告書', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'tm-5', phaseUid: 'p-2', taskName: '品質管理検査', taskDescription: '品質管理のための検査', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'tm-6', phaseUid: 'p-3', taskName: '完成検査', taskDescription: '工事完成後の検査', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'tm-7', phaseUid: 'p-4', taskName: '基本設計', taskDescription: '基本設計書の作成', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') },
  { uid: 'tm-8', phaseUid: 'p-5', taskName: '実施設計', taskDescription: '実施設計書の作成', createdBy: 'user1', createdAt: new Date('2024-01-01'), updatedBy: 'user1', updatedAt: new Date('2024-01-01') }
];

// プロジェクトマスタ
export const mockProjects: Project[] = [
  {
    uid: 'proj1',
    kojiUid: 'koji3',
    projectName: '保倉川他河川巡視委託(R6)',
    taskUids: ['task1', 'task2', 'task3'],
    projectType: 'construction',
    createdBy: 'user1',
    createdAt: new Date('2024-03-01'),
    updatedBy: 'user1',
    updatedAt: new Date('2024-03-01')
  },
  {
    uid: 'proj2',
    kojiUid: 'koji2',
    projectName: '公民館改修プロジェクト',
    taskUids: ['task4', 'task5'],
    projectType: 'construction',
    createdBy: 'user2',
    createdAt: new Date('2024-04-01'),
    updatedBy: 'user2',
    updatedAt: new Date('2024-04-01')
  },
  {
    uid: 'proj3',
    kojiUid: 'koji3',
    projectName: '保倉川他河川巡視委託(R6)',
    taskUids: ['task1', 'task2', 'task3'],
    projectType: 'construction',
    createdBy: 'user1',
    createdAt: new Date('2024-03-01'),
    updatedBy: 'user1',
    updatedAt: new Date('2024-03-01')
  },
  {
    uid: 'proj4',
    kojiUid: '',
    projectName: '事務所大掃除',
    taskUids: ['task1', 'task2', 'task3'],
    projectType: 'general',
    createdBy: 'user1',
    createdAt: new Date('2024-03-01'),
    updatedBy: 'user1',
    updatedAt: new Date('2024-03-01')
  },
];

// タスクマスタ
export const mockTasks: Task[] = [
  {
    uid: 'task1',
    projectUid: 'proj1',
    taskMasterUid: 'tm1',
    status: 'completed',
    assigneeUid: 'user1',
    dueDate: new Date('2024-04-15'),
    createdBy: 'user1',
    createdAt: new Date('2024-03-01'),
    updatedBy: 'user1',
    updatedAt: new Date('2024-04-10')
  },
  {
    uid: 'task2',
    projectUid: 'proj1',
    taskMasterUid: 'tm2',
    status: 'in_progress',
    assigneeUid: 'user2',
    dueDate: new Date('2024-04-30'),
    createdBy: 'user1',
    createdAt: new Date('2024-03-01'),
    updatedBy: 'user2',
    updatedAt: new Date('2024-04-15')
  },
  {
    uid: 'task3',
    projectUid: 'proj1',
    taskMasterUid: 'tm3',
    status: 'not_started',
    assigneeUid: 'user3',
    dueDate: new Date('2024-05-15'),
    createdBy: 'user1',
    createdAt: new Date('2024-03-01'),
    updatedBy: 'user1',
    updatedAt: new Date('2024-03-01')
  },
  {
    uid: 'task4',
    projectUid: 'proj2',
    taskMasterUid: 'tm4',
    status: 'in_progress',
    assigneeUid: 'user4',
    dueDate: new Date('2024-05-31'),
    createdBy: 'user2',
    createdAt: new Date('2024-04-01'),
    updatedBy: 'user4',
    updatedAt: new Date('2024-04-20')
  },
  {
    uid: 'task5',
    projectUid: 'proj2',
    taskMasterUid: 'tm5',
    status: 'not_started',
    assigneeUid: 'user5',
    dueDate: new Date('2024-06-15'),
    createdBy: 'user2',
    createdAt: new Date('2024-04-01'),
    updatedBy: 'user2',
    updatedAt: new Date('2024-04-01')
  }
];