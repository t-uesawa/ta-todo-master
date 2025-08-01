import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar as CalendarIcon,
  Check,
  X,
  FileText,
  HardHat,
  SquarePen,
  XIcon
} from 'lucide-react';
import { TaskMasterTreeView } from '../TreeView';
import { Project, Task, TaskMaster } from '../../../../types';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/hooks/data/use-project';
import { useMaster } from '@/hooks/data/use-master';
import { generateUid } from '@/lib/generateUid';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ProjectCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject?: Project | null;
  onDetailTaskMasterOpen: (tm: TaskMaster) => void;
}

interface FreeTask {
  id: string; // 'free-' + generateUid() で生成
  name: string;
  description?: string;
  type: 'free';
}

interface ProjectFormData {
  projectName: string;
  projectType: 'construction' | 'general';
  kojiUid?: string;
  selectedTaskMasters: string[];  // タスクマスタUID
  freeTasks: FreeTask[];  // フリータスク
  taskAssignments: Record<string, { assigneeUid: string; dueDate: string, memo: string }>;
  memo: string;
}

const steps = [
  { id: 1, title: 'プロジェクト情報', description: 'プロジェクトの基本情報を入力' },
  { id: 2, title: 'タスク選択', description: 'タスク（やること）を追加' },
  { id: 3, title: 'タスク設定', description: '担当者と期日を設定' }
];

export function ProjectCreationDrawer({ isOpen, onClose, editingProject, onDetailTaskMasterOpen }: ProjectCreationDrawerProps) {
  const { error, addProject, updateProject } = useProject();
  const { constructions, taskMasters } = useMaster();
  const { state: authState } = useAuth();
  // フリータスク
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  // プロジェクト
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: '',
    projectType: 'construction',
    kojiUid: '',
    selectedTaskMasters: [],
    freeTasks: [],
    taskAssignments: {},
    memo: '',
  });
  const [calendarOpenMap, setCalendarOpenMap] = useState<Record<string, boolean>>({});

  const setCalendarOpen = (tmUid: string, open: boolean) => {
    setCalendarOpenMap(prev => ({ ...prev, [tmUid]: open }));
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setFormData({
      projectName: '',
      projectType: 'general',
      kojiUid: undefined,
      selectedTaskMasters: [],
      freeTasks: [],
      taskAssignments: {},
      memo: '',
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // タスク割り当て設定で使用するすべてのタスクを取得
  const getAllTasks = () => [
    ...taskMasters.filter(tm => formData.selectedTaskMasters.includes(tm.uid))
      .map(tm => ({ id: tm.uid, name: tm.taskName, description: tm.taskDescription, type: 'master' as const })),
    ...formData.freeTasks.map(ft => ({ id: ft.id, name: ft.name, description: ft.description, type: 'free' as const }))
  ];

  const handleAddFreeTask = () => {
    if (!newTaskName.trim()) return;

    const newFreeTask: FreeTask = {
      id: `free-${generateUid()}`,
      name: newTaskName.trim(),
      description: newTaskDescription.trim() || undefined,
      type: 'free'
    };

    setFormData(prev => ({
      ...prev,
      freeTasks: [...prev.freeTasks, newFreeTask],
      taskAssignments: {
        ...prev.taskAssignments,
        [newFreeTask.id]: {
          assigneeUid: '',
          dueDate: dayjs().add(1, 'w').format('YYYY/MM/DD'),
          memo: '',
        }
      }
    }));

    setNewTaskName('');
    setNewTaskDescription('');
  };

  const handleRemoveFreeTask = (freeTaskId: string) => {
    setFormData(prev => {
      const { [freeTaskId]: removed, ...restAssignments } = prev.taskAssignments;
      console.log(`削除: ${removed}`);
      return {
        ...prev,
        freeTasks: prev.freeTasks.filter(ft => ft.id !== freeTaskId),
        taskAssignments: restAssignments
      };
    });
  };

  const handleTaskMasterSelect = (taskMasterUids: string[]) => {
    setFormData(prev => ({
      ...prev,
      selectedTaskMasters: taskMasterUids,
      taskAssignments: taskMasterUids.reduce((acc, uid) => {
        const taskMaster = taskMasters.find(tm => tm.uid === uid);
        acc[uid] = prev.taskAssignments[uid] || {
          assigneeUid: taskMaster?.primaryAssignee || '',
          dueDate: dayjs().add(1, 'w').format('YYYY/MM/DD'),
          memo: '',
        };
        return acc;
      }, {} as Record<string, { assigneeUid: string; dueDate: string, memo: string }>)
    }));
  };

  const handleRemoveTaskMasterSelect = (taskId: string) => {
    setFormData(prev => {
      return {
        ...prev,
        selectedTaskMasters: prev.selectedTaskMasters.filter(tmId => tmId !== taskId),
      };
    });
  };

  const handleAssignmentChange = (taskMasterUid: string, field: 'assigneeUid' | 'dueDate' | 'memo', value: string) => {
    setFormData(prev => ({
      ...prev,
      taskAssignments: {
        ...prev.taskAssignments,
        [taskMasterUid]: {
          ...prev.taskAssignments[taskMasterUid],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const userUid = authState.user?.uid || '';

    if (editingProject) {
      const newTasks: Task[] = [];

      // タスクマスタの処理
      formData.selectedTaskMasters.forEach(tm => {
        const updateTask = editingProject.tasks.find(task => task.taskMasterUid === tm);

        // データに変更があれば更新
        if (updateTask) {
          newTasks.push(
            updateTask.assigneeUid !== formData.taskAssignments[tm].assigneeUid ||
              updateTask.dueDate !== formData.taskAssignments[tm].dueDate ||
              updateTask.memo !== formData.taskAssignments[tm].memo ?
              {
                ...updateTask,
                taskMasterUid: tm,
                assigneeUid: formData.taskAssignments[tm].assigneeUid,
                dueDate: formData.taskAssignments[tm].dueDate,
                memo: formData.taskAssignments[tm].memo,
                updatedBy: userUid,
                updatedAt: now,
              } : updateTask
          );
        } else {
          // 一致するタスクがなければ追加
          const uid = generateUid();
          newTasks.push({
            uid: `${editingProject.uid}-${uid}`,
            projectUid: editingProject.uid,
            taskMasterUid: tm,
            taskName: '',
            status: 'not_started' as const,
            assigneeUid: formData.taskAssignments[tm].assigneeUid,
            dueDate: formData.taskAssignments[tm].dueDate,
            memo: formData.taskAssignments[tm].memo,
            createdBy: userUid,
            createdAt: now,
            updatedBy: userUid,
            updatedAt: now,
            deletedBy: '',
            deletedAt: '',
          });
        }
      });

      // フリータスクの処理
      formData.freeTasks.forEach(freeTask => {
        const existingTask = editingProject.tasks.find(task => task.uid === freeTask.id);
        if (existingTask) {
          newTasks.push(
            existingTask.taskName !== freeTask.name ||
              existingTask.assigneeUid !== formData.taskAssignments[freeTask.id].assigneeUid ||
              existingTask.dueDate !== formData.taskAssignments[freeTask.id].dueDate ||
              existingTask.memo !== formData.taskAssignments[freeTask.id].memo ?
              {
                ...existingTask,
                taskName: freeTask.name,
                assigneeUid: formData.taskAssignments[freeTask.id].assigneeUid,
                dueDate: formData.taskAssignments[freeTask.id].dueDate,
                memo: formData.taskAssignments[freeTask.id].memo,
                updatedBy: userUid,
                updatedAt: now,
              } : existingTask);
        } else {
          newTasks.push({
            uid: freeTask.id,
            projectUid: editingProject.uid,
            taskMasterUid: '',
            taskName: freeTask.name,
            status: 'not_started' as const,
            assigneeUid: formData.taskAssignments[freeTask.id].assigneeUid,
            dueDate: formData.taskAssignments[freeTask.id].dueDate,
            memo: formData.taskAssignments[freeTask.id].memo,
            createdBy: userUid,
            createdAt: now,
            updatedBy: userUid,
            updatedAt: now,
            deletedBy: '',
            deletedAt: '',
          });
        }
      });

      const newProject: Project = {
        ...editingProject,
        ...(formData.kojiUid && { kojiUid: formData.kojiUid }),
        tasks: newTasks,
        projectName: formData.projectName,
        projectType: formData.projectType,
        memo: formData.memo,
      }

      await updateProject(newProject);
    } else {
      // プロジェクト新規作成
      const uid = generateUid();
      const projectUid = `proj-${uid}`;

      const newProject: Omit<Project, 'tasks'> = {
        uid: projectUid,
        ...(formData.kojiUid !== undefined && { kojiUid: formData.kojiUid }),
        projectName: formData.projectName,
        projectType: formData.projectType,
        memo: formData.memo,
        isCompleted: false,
        createdBy: userUid,
        createdAt: now,
        updatedBy: userUid,
        updatedAt: now,
        deletedBy: '',
        deletedAt: '',
      };

      const allTasksForCreation = [
        ...formData.selectedTaskMasters.map(tmUid => ({
          uid: `${projectUid}-${generateUid()}`,
          projectUid,
          taskMasterUid: tmUid,
          taskName: '', // マスタから自動設定される
          status: 'not_started' as const,
          assigneeUid: formData.taskAssignments[tmUid].assigneeUid,
          dueDate: formData.taskAssignments[tmUid].dueDate,
          memo: formData.taskAssignments[tmUid].memo,
          createdBy: userUid,
          createdAt: now,
          updatedBy: userUid,
          updatedAt: now,
          deletedBy: '',
          deletedAt: '',
        } as Task)),
        ...formData.freeTasks.map(freeTask => ({
          uid: freeTask.id,
          projectUid,
          taskMasterUid: '',
          taskName: freeTask.name,
          status: 'not_started' as const,
          assigneeUid: formData.taskAssignments[freeTask.id].assigneeUid,
          dueDate: formData.taskAssignments[freeTask.id].dueDate,
          memo: formData.taskAssignments[freeTask.id].memo,
          createdBy: userUid,
          createdAt: now,
          updatedBy: userUid,
          updatedAt: now,
          deletedBy: '',
          deletedAt: '',
        } as Task))
      ];

      await addProject(newProject, allTasksForCreation);
    }

    if (error) {
      return;
    }

    handleClose();
  };

  useEffect(() => {
    if (!editingProject) return;

    // マスタタスクとフリータスクを分離
    const masterTasks = editingProject.tasks.filter(task => task.taskMasterUid);
    const freeTasks = editingProject.tasks.filter(task => !task.taskMasterUid);

    setFormData({
      projectName: editingProject.projectName || '',
      projectType: editingProject.projectType || 'construction',
      kojiUid: editingProject.kojiUid,
      memo: editingProject.memo,
      selectedTaskMasters: masterTasks.map(task => task.taskMasterUid!),
      freeTasks: freeTasks.map(task => ({
        id: task.uid,
        name: task.taskName,
        description: task.memo, // 必要に応じて追加
        type: 'free' as const
      })),
      taskAssignments: editingProject.tasks.reduce((acc, task) => {
        if (task.assigneeUid && task.dueDate) {
          const key = task.taskMasterUid || task.uid;
          acc[key] = {
            assigneeUid: task.assigneeUid,
            dueDate: task.dueDate,
            memo: task.memo,
          };
        }
        return acc;
      }, {} as Record<string, { assigneeUid: string; dueDate: string, memo: string }>)
    });
  }, [editingProject]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectType">プロジェクトタイプ</Label>
              <Select
                value={formData.projectType}
                onValueChange={(value: 'construction' | 'general') =>
                  setFormData(prev => ({ ...prev, projectType: value, kojiUid: value === 'general' ? undefined : prev.kojiUid }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="construction">工事プロジェクト</SelectItem>
                  <SelectItem value="general">一般プロジェクト</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.projectType === 'construction' && (
              <div className="space-y-2">
                <Label htmlFor="koji">工事選択</Label>
                <Select
                  value={formData.kojiUid || ''}
                  onValueChange={(value) =>
                    setFormData(prev => ({
                      ...prev,
                      kojiUid: value || undefined,
                      projectName: constructions.find(con => con.id === value)?.label || ''
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="工事マスタを選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {constructions.map(koji => (
                      <SelectItem key={koji.id} value={koji.id}>
                        {koji.label}（{koji.client}）
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  *選択肢に工事がない場合は「工事管理アプリ」で表示切替を行ってください。</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="projectName">プロジェクト名</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="プロジェクト名を入力..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">メモ</Label>
              <Textarea
                id="projectName"
                value={formData.memo}
                onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                lang='ja'
                placeholder="プロジェクトのメモを入力..."
                rows={4}
                autoComplete='off'
              />
            </div>

            {formData.kojiUid && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardHat className="h-5 w-5" />
                    工事情報
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const koji = constructions.find(c => c.id === formData.kojiUid);
                    return koji ? (
                      <div className="space-y-2 text-sm">
                        <div className='w-full flex'>
                          <p className='w-1/5'>工事名:</p>
                          <p className='w-4/5'>{koji.label}</p>
                        </div>
                        <div className='w-full flex'>
                          <p className='w-1/5'>発注者:</p>
                          <p className='w-4/5'>{koji.client}</p>
                        </div>
                        <div className='w-full flex'>
                          <p className='w-1/5'>工期:</p>
                          <p className='w-4/5'>{dayjs(koji.start).format('YYYY/MM/DD')} ～ {dayjs(koji.end).format('YYYY/MM/DD')}</p>
                        </div>
                        <div className='w-full flex'>
                          <p className='w-1/5'>金額:</p>
                          <p className='w-4/5'>{koji.contractAmount ? `${parseInt(koji.contractAmount).toLocaleString()}円` : '不明'}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* 既存のタスクマスタ選択 */}
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">タスクマスタ選択</h3>
            </div>
            <TaskMasterTreeView
              type='preview'
              selectedTaskMasters={formData.selectedTaskMasters}
              onSelectionChange={handleTaskMasterSelect}
              onIconButtonClick={(tmUid) => onDetailTaskMasterOpen(taskMasters.find(tm => tm.uid === tmUid)!)}
            />

            {/* フリータスク追加セクション */}
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SquarePen className="h-5 w-5" />
                <h3 className="text-lg font-semibold">一般タスク追加</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="タスク名"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                />
                <Input
                  placeholder="説明（任意）"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <Button
                  onClick={handleAddFreeTask}
                  disabled={!newTaskName.trim()}
                  className="w-full"
                >
                  一般タスク追加
                </Button>
              </div>
            </div>

            {/* 選択済みタスク表示（マスタ + フリー統合） */}
            {(formData.selectedTaskMasters.length > 0 || formData.freeTasks.length > 0) && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  {/* 選択されたタスク: {formData.selectedTaskMasters.length + formData.freeTasks.length}件 */}
                  選択されたタスク
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* マスタタスク */}
                  {formData.selectedTaskMasters.map(tmUid => {
                    const taskMaster = taskMasters.find(tm => tm.uid === tmUid);
                    return taskMaster ? (
                      <Badge key={tmUid} variant="secondary" className='pr-1 gap-1.5'>
                        {taskMaster.taskName}
                        <XIcon onClick={() => handleRemoveTaskMasterSelect(tmUid)} className="h-4 w-4" />
                      </Badge>
                    ) : null;
                  })}
                  {/* フリータスク */}
                  {formData.freeTasks.map(freeTask => (
                    <Badge key={freeTask.id} variant="outline" className='pr-1 gap-1.5'>
                      {freeTask.name}
                      <XIcon onClick={() => handleRemoveFreeTask(freeTask.id)} className="h-4 w-4" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <h3 className="text-lg font-semibold">タスク詳細設定</h3>
            </div>
            <div className="space-y-4">
              {getAllTasks().map(task => {
                const assignment = formData.taskAssignments[task.id];

                return (
                  <Card key={task.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {task.name}
                        {task.type === 'free' ? (
                          <Badge variant="outline" className="text-xs">一般</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">マスタ</Badge>
                        )}
                      </CardTitle>
                      {task.description && (
                        <CardDescription>{task.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>担当者</Label>
                          <Select
                            value={assignment?.assigneeUid || ''}
                            onValueChange={(value) => handleAssignmentChange(task.id, 'assigneeUid', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="担当者を選択..." />
                            </SelectTrigger>
                            <SelectContent>
                              {authState.users.map(user => (
                                <SelectItem key={user.uid} value={user.uid}>
                                  <span className="font-medium">{user.name}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>期日</Label>
                          <Dialog open={calendarOpenMap[task.id] || false} onOpenChange={(open) => setCalendarOpen(task.id, open)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {assignment?.dueDate
                                  ? dayjs(assignment.dueDate).format('YYYY/MM/DD')
                                  : '期日を選択...'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-auto p-6">
                              <DialogTitle>期日設定</DialogTitle>
                              <DialogDescription>{`${task.name}の期日を設定`}</DialogDescription>
                              <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                selected={dayjs(assignment?.dueDate).toDate() ?? undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    handleAssignmentChange(task.id, 'dueDate', dayjs(date).format('YYYY/MM/DD'));
                                    setCalendarOpen(task.id, false);
                                  }
                                }}
                                initialFocus
                                disabled={(date) => date < new Date()} // 過去の日付は無効化
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>メモ</Label>
                        <Textarea
                          value={assignment?.memo || ''}
                          onChange={(e) => handleAssignmentChange(task.id, 'memo', e.target.value)}
                          lang='ja'
                          placeholder="(任意) タスクのメモを入力..."
                          rows={2}
                          autoComplete='off'
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.projectName.trim() !== '' &&
          (formData.projectType === 'general' || formData.kojiUid);
      case 2:
        return formData.freeTasks.length + formData.selectedTaskMasters.length > 0;
      case 3:
        return formData.selectedTaskMasters.every(tmUid => {
          const assignment = formData.taskAssignments[tmUid];
          return assignment && assignment.assigneeUid && assignment.dueDate;
        })
          &&
          formData.freeTasks.every(task => {
            const assignment = formData.taskAssignments[task.id];
            return assignment && assignment.assigneeUid && assignment.dueDate;
          });
      default:
        return false;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingProject ? 'プロジェクト編集' : '新規プロジェクト作成'}
          </SheetTitle>
          <SheetDescription>
            {steps[currentStep - 1].description}
          </SheetDescription>
        </SheetHeader>

        {/* ステッパー */}
        <div className="flex items-center justify-between my-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* ステップコンテンツ */}
        <div className="flex-1 min-h-0 pb-6">
          {renderStepContent()}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePrevious}
            className="flex items-center gap-2"
          >
            {currentStep === 1 ? (
              <>
                <X className="h-4 w-4" />
                キャンセル
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                戻る
              </>
            )}
          </Button>

          <Button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {currentStep === 3 ? (
              <>
                <Check className="h-4 w-4" />
                {editingProject ? '更新' : '作成'}
              </>
            ) : (
              <>
                次へ
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}