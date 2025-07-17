import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Building,
  Users,
  Calendar as CalendarIcon,
  Check,
  X,
  FileText
} from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import { TaskMasterTreeView } from './TaskMasterTreeView';
import { Project, Task } from '../../../types';

interface ProjectCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject?: Project | null;
}

interface ProjectFormData {
  projectName: string;
  projectType: 'construction' | 'general';
  kojiUid?: string;
  selectedTaskMasters: string[];
  taskAssignments: Record<string, { assigneeUid: string; dueDate: Date }>;
}

const steps = [
  { id: 1, title: 'プロジェクト情報', description: '基本情報を入力' },
  { id: 2, title: 'タスク選択', description: 'タスクマスタから選択' },
  { id: 3, title: 'タスク設定', description: '担当者と期日を設定' }
];

export function ProjectCreationDrawer({ isOpen, onClose, editingProject }: ProjectCreationDrawerProps) {
  const { state: appState, dispatch } = useApp();
  const { state: authState } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: editingProject?.projectName || '',
    projectType: editingProject?.projectType || 'construction',
    kojiUid: editingProject?.kojiUid,
    selectedTaskMasters: [],
    taskAssignments: {}
  });

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

  const handleTaskMasterSelect = (taskMasterUids: string[]) => {
    setFormData(prev => ({
      ...prev,
      selectedTaskMasters: taskMasterUids,
      taskAssignments: taskMasterUids.reduce((acc, uid) => {
        acc[uid] = prev.taskAssignments[uid] || {
          assigneeUid: authState.user?.uid || '',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1週間後
        };
        return acc;
      }, {} as Record<string, { assigneeUid: string; dueDate: Date }>)
    }));
  };

  const handleAssignmentChange = (taskMasterUid: string, field: 'assigneeUid' | 'dueDate', value: string | Date) => {
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

  const handleSubmit = () => {
    const projectUid = editingProject?.uid || `proj_${Date.now()}`;
    const now = new Date();

    const newProject: Project = {
      uid: projectUid,
      kojiUid: formData.kojiUid,
      projectName: formData.projectName,
      taskUids: formData.selectedTaskMasters.map(tmUid => `task_${projectUid}_${tmUid}`),
      projectType: formData.projectType,
      createdBy: authState.user?.uid || '',
      createdAt: editingProject?.createdAt || now,
      updatedBy: authState.user?.uid || '',
      updatedAt: now
    };

    const newTasks: Task[] = formData.selectedTaskMasters.map(tmUid => ({
      uid: `task_${projectUid}_${tmUid}`,
      projectUid,
      taskMasterUid: tmUid,
      status: 'not_started' as const,
      assigneeUid: formData.taskAssignments[tmUid].assigneeUid,
      dueDate: formData.taskAssignments[tmUid].dueDate,
      createdBy: authState.user?.uid || '',
      createdAt: now,
      updatedBy: authState.user?.uid || '',
      updatedAt: now
    }));

    if (editingProject) {
      dispatch({ type: 'UPDATE_PROJECT', payload: newProject });
      // 既存のタスクを削除して新しいタスクを追加
      editingProject.taskUids.forEach(taskUid => {
        dispatch({ type: 'DELETE_TASK', payload: taskUid });
      });
    } else {
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    }

    newTasks.forEach(task => {
      dispatch({ type: 'ADD_TASK', payload: task });
    });

    onClose();
    setCurrentStep(1);
    setFormData({
      projectName: '',
      projectType: 'general',
      kojiUid: undefined,
      selectedTaskMasters: [],
      taskAssignments: {}
    });
  };

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
                  <SelectItem value="general">一般プロジェクト</SelectItem>
                  <SelectItem value="construction">建設工事</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.projectType === 'construction' && (
              <div className="space-y-2">
                <Label htmlFor="koji">工事選択</Label>
                <Select
                  value={formData.kojiUid || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, kojiUid: value || undefined, projectName: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="工事を選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {appState.constructions.map(koji => (
                      <SelectItem key={koji.uid} value={koji.uid}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{koji.kojiName}</span>
                          <span className="text-xs text-gray-500">{koji.orderer}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            {formData.kojiUid && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    工事情報
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const koji = appState.constructions.find(c => c.uid === formData.kojiUid);
                    return koji ? (
                      <div className="space-y-2 text-sm">
                        <div><strong>工事名:</strong> {koji.kojiFullName}</div>
                        <div><strong>発注者:</strong> {koji.orderer}</div>
                        <div><strong>工期:</strong> {format(koji.startDate, 'yyyy/MM/dd', { locale: ja })} ～ {format(koji.endDate, 'yyyy/MM/dd', { locale: ja })}</div>
                        <div><strong>契約金額:</strong> {koji.contractAmount.toLocaleString()}円</div>
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
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">タスクマスタ選択</h3>
            </div>
            {/** タスクマスタ選択(ツリー) */}
            <TaskMasterTreeView
              type='preview'
              selectedTaskMasters={formData.selectedTaskMasters}
              onSelectionChange={handleTaskMasterSelect}
              onIconButtonClick={() => { }}
            />
            {formData.selectedTaskMasters.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">選択されたタスク: {formData.selectedTaskMasters.length}件</p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedTaskMasters.map(tmUid => {
                    const taskMaster = appState.taskMasters.find(tm => tm.uid === tmUid);
                    return taskMaster ? (
                      <Badge key={tmUid} variant="secondary">
                        {taskMaster.taskName}
                      </Badge>
                    ) : null;
                  })}
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
              <h3 className="text-lg font-semibold">タスク設定</h3>
            </div>
            <div className="space-y-4">
              {formData.selectedTaskMasters.map(tmUid => {
                const taskMaster = appState.taskMasters.find(tm => tm.uid === tmUid);
                const assignment = formData.taskAssignments[tmUid];

                return taskMaster ? (
                  <Card key={tmUid}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{taskMaster.taskName}</CardTitle>
                      {taskMaster.taskDescription && (
                        <CardDescription>{taskMaster.taskDescription}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>担当者</Label>
                          <Select
                            value={assignment?.assigneeUid || ''}
                            onValueChange={(value) => handleAssignmentChange(tmUid, 'assigneeUid', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="担当者を選択..." />
                            </SelectTrigger>
                            <SelectContent>
                              {authState.users.map(user => (
                                <SelectItem key={user.uid} value={user.uid}>
                                  <div className="flex flex-col text-left">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-xs text-gray-500">{user.department}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>期日</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {assignment?.dueDate ? format(assignment.dueDate, 'yyyy/MM/dd', { locale: ja }) : '期日を選択...'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={assignment?.dueDate}
                                onSelect={(date) => date && handleAssignmentChange(tmUid, 'dueDate', date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
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
        return formData.selectedTaskMasters.length > 0;
      case 3:
        return formData.selectedTaskMasters.every(tmUid => {
          const assignment = formData.taskAssignments[tmUid];
          return assignment && assignment.assigneeUid && assignment.dueDate;
        });
      default:
        return false;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
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
        <div className="flex-1 min-h-0">
          {renderStepContent()}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
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