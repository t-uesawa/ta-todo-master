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
    id: "pj-001",
    code: "10001",
    label: "橋梁補修",
    fullLabel: "国道123号橋梁補修工事",
    start: "2023-04-01",
    end: "2024-02-15",
    locations: [{ lat: 35.6895, lng: 139.6917 }],
    caseNumber: "0123",
    client: "国土交通省",
    completionFlag: "2",
    contractAmount: "45000000",
    contractDate: "2023-03-15",
    displayFlag: true,
  },
  {
    id: "pj-002",
    code: "10002",
    label: "トンネル点検",
    fullLabel: "青山トンネル定期点検",
    start: "2023-05-10",
    end: "2023-11-30",
    locations: [{ lat: 34.6937, lng: 135.5023 }],
    caseNumber: "0456",
    client: "東京都建設局",
    completionFlag: "1",
    contractAmount: "32000000",
    contractDate: "2023-04-25",
    displayFlag: true,
  },
  {
    id: "pj-003",
    code: "10003",
    label: "道路改良",
    fullLabel: "国道58号道路改良工事",
    start: "2022-08-01",
    end: "2023-12-20",
    locations: [{ lat: 26.2124, lng: 127.6809 }],
    caseNumber: "0789",
    client: "沖縄県",
    completionFlag: "3",
    contractAmount: "60000000",
    contractDate: "2022-07-15",
    displayFlag: false,
  },
  {
    id: "pj-004",
    code: "10004",
    label: "河川護岸",
    fullLabel: "多摩川護岸補強工事",
    start: "2023-06-20",
    end: "2024-01-31",
    locations: [{ lat: 35.6176, lng: 139.6454 }],
    caseNumber: "0234",
    client: "川崎市",
    completionFlag: "2",
    contractAmount: "27000000",
    contractDate: "2023-06-01",
    displayFlag: true,
  },
  {
    id: "pj-005",
    code: "10005",
    label: "下水道工事",
    fullLabel: "新宿区下水道再整備工事",
    start: "2023-03-01",
    end: "2023-10-15",
    locations: [{ lat: 35.6938, lng: 139.7034 }],
    caseNumber: "0567",
    client: "新宿区役所",
    completionFlag: "1",
    contractAmount: "38000000",
    contractDate: "2023-02-10",
    displayFlag: true,
  },
  {
    id: "pj-006",
    code: "10006",
    label: "橋耐震化",
    fullLabel: "東名高速耐震補強工事",
    start: "2023-01-05",
    end: "2024-04-30",
    locations: [{ lat: 35.4626, lng: 139.6200 }],
    caseNumber: "0890",
    client: "中日本高速道路株式会社",
    completionFlag: "2",
    contractAmount: "80000000",
    contractDate: "2022-12-20",
    displayFlag: true,
  },
  {
    id: "pj-007",
    code: "10007",
    label: "舗装工事",
    fullLabel: "区道舗装復旧工事",
    start: "2022-09-15",
    end: "2023-05-01",
    locations: [{ lat: 35.7763, lng: 139.8131 }],
    caseNumber: "0345",
    client: "足立区役所",
    completionFlag: "3",
    contractAmount: "15000000",
    contractDate: "2022-08-10",
    displayFlag: false,
  },
  {
    id: "pj-008",
    code: "10008",
    label: "橋梁新設",
    fullLabel: "多摩川第二大橋新設工事",
    start: "2023-07-01",
    end: "2025-03-31",
    locations: [{ lat: 35.6268, lng: 139.6654 }],
    caseNumber: "0678",
    client: "国土交通省 関東地方整備局",
    completionFlag: "1",
    contractAmount: "120000000",
    contractDate: "2023-06-01",
    displayFlag: true,
  },
  {
    id: "pj-009",
    code: "10009",
    label: "法面工",
    fullLabel: "山腹法面保護工事",
    start: "2023-02-10",
    end: "2023-09-25",
    locations: [{ lat: 36.2048, lng: 138.2529 }],
    caseNumber: "0111",
    client: "長野県",
    completionFlag: "2",
    contractAmount: "26000000",
    contractDate: "2023-01-25",
    displayFlag: true,
  },
  {
    id: "pj-010",
    code: "10010",
    label: "道路照明",
    fullLabel: "湾岸線道路照明LED化工事",
    start: "2023-08-01",
    end: "2024-01-31",
    locations: [{ lat: 35.6239, lng: 139.7761 }],
    caseNumber: "0999",
    client: "東京湾岸開発株式会社",
    completionFlag: "1",
    contractAmount: "41000000",
    contractDate: "2023-07-10",
    displayFlag: true,
  },
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