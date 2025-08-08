/**
 * プロジェクト一覧メインコンポーネント
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  FolderOpen,
  Plus,
  Eye,
  Edit,
  Trash2,
  CircleCheck,
  FolderPlus,
  FolderPen,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ProjectCreationDrawer } from './drawer/ProjectCreationDrawer';
import { Project, Task, TaskMaster } from '../../../types';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import { ProjectDetailDrawer } from './drawer/ProjectDetailDrawer';
import { useProject } from '@/hooks/data/use-project';
import { mockConstructions } from '@/data/mockData';
import dayjs from 'dayjs';
import { TaskMasterDetailDialog } from './drawer/TaskMasterDetailDialog';
import { toast } from 'sonner';

export function ProjectList() {
  const { projects, tasks, deleteProject, lockProject, unlockProject } = useProject();
  const { state: authState } = useAuth();
  const { isMobile } = useResponsive();
  const [creationDrawerOpen, setCreationDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<Project | null>(null);
  const [detailTaskMasterOpen, setDetailTaskMasterOpen] = useState(false);
  const [detailTaskMasterTarget, setDetailTaskMasterTarget] = useState<TaskMaster | null>(null)

  const getConstruction = (constructionUid: string) => {
    return mockConstructions.find(c => c.id === constructionUid);
  }

  const getProjectTaskCount = (projectUid: string) => {
    return tasks.filter(t => t.projectUid === projectUid).length;
  };

  const getProjectCompletedTaskCount = (projectUid: string) => {
    return tasks.filter(t => t.projectUid === projectUid && t.status === 'completed').length;
  };

  const getUserName = (userUid: string) => {
    const user = authState.users.find(u => u.uid === userUid);
    return user?.name || '不明';
  };

  const getProjectTypeBadge = (type: string) => {
    switch (type) {
      case 'construction':
        return <Badge variant="default">工事</Badge>;
      case 'general':
        return <Badge variant="secondary">一般</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleComplete = (project: Project) => {
    setCompleteTarget(project);
    setCompleteConfirmOpen(true);
  }

  const confirmComplete = async () => {
    if (!completeTarget) return;

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const userUid = authState.user?.uid || '';

    const completeProjectData: Project = {
      ...completeTarget,
      isCompleted: true,
      updatedBy: userUid,
      updatedAt: now,
    };

    // プロジェクトの完了は削除と同じ扱い
    await deleteProject(completeProjectData);
    setCompleteConfirmOpen(false);
    setCompleteTarget(null);
  };

  const handleDetail = (project: Project) => {
    setSelectedProject(project);
    setDetailDrawerOpen(true);
  }

  const handleEdit = async (project: Project) => {
    try {
      await lockProject(project);
      setEditingProject(project);
      setCreationDrawerOpen(true);
    } catch (err) {
      console.error('LOCK FAILED', err);
      const errMsg = err instanceof Error ? err.message : '編集不可';
      toast.error('編集不可', { description: errMsg });
    }
  };

  const handleDelete = (project: Project) => {
    setDeleteTarget(project);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const userUid = authState.user?.uid || '';

    const deletedTasks: Task[] = [];

    deleteTarget.tasks.forEach(task => (
      deletedTasks.push({
        ...task,
        updatedBy: userUid,
        updatedAt: now,
        deletedBy: userUid,
        deletedAt: now,
      })
    ));

    const deleteProjectData: Project = {
      ...deleteTarget,
      tasks: deletedTasks,
      updatedBy: userUid,
      updatedAt: now,
      deletedBy: userUid,
      deletedAt: now,
    };

    await deleteProject(deleteProjectData);
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleCreationDrawerClose = async () => {
    // ロック解除
    try {
      if (editingProject) await unlockProject(editingProject);
    } catch (err) {
      console.error('LOCK FAILED', err);
      const errMsg = err instanceof Error ? err.message : '編集不可';
      toast.error('編集不可', { description: errMsg });
    } finally {
      setCreationDrawerOpen(false);
      setEditingProject(null);
    }
  };

  const handleDetailDrawerClose = () => {
    setDetailDrawerOpen(false);
    setSelectedProject(null);
  };

  const handleDetailTaskMasterOpen = (tm: TaskMaster) => {
    setDetailTaskMasterTarget(tm);
    setDetailTaskMasterOpen(true);
  };

  const handleDetailTaskMasterClose = () => {
    setDetailTaskMasterTarget(null);
    setDetailTaskMasterOpen(false);
  };

  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex items-center justify-between flex-shrink-0 h-12 my-2">
        <h2 className={cn("font-bold", isMobile ? "text-xl px-2" : "text-2xl")}>プロジェクト</h2>
        <Button onClick={() => setCreationDrawerOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規プロジェクト
        </Button>
      </div>

      {/** カード一覧 */}
      <div className="flex-1 overflow-hidden p-1">
        <div className="h-full overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map(project => {
              const construction = project.kojiUid ? getConstruction(project.kojiUid) : undefined;
              const taskCount = getProjectTaskCount(project.uid);
              const completedTaskCount = getProjectCompletedTaskCount(project.uid);
              const completionRate = taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0;

              return (
                <Card key={project.uid} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        {getProjectTypeBadge(project.projectType)}
                      </div>
                      <div className="flex gap-0.5">
                        {project.tasks.every(task => task.status === 'completed') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComplete(project)}
                          >
                            <CircleCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDetail(project)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(project)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{project.projectName}</CardTitle>
                    <CardDescription>
                      {construction?.code || '一般プロジェクト'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">タスク進捗</span>
                      <span className="font-medium">
                        {completedTaskCount}/{taskCount} ({completionRate.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5 text-gray-400" />
                        <span>{`${dayjs(project.createdAt).format('YYYY年MM月DD日 HH:mm')} / ${getUserName(project.createdBy)}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FolderPen className="h-5 w-5 text-gray-400" />
                        <span>{`${dayjs(project.updatedAt).format('YYYY年MM月DD日 HH:mm')} / ${getUserName(project.updatedBy)}`}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">プロジェクトがありません。</p>
              <Button onClick={() => setCreationDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                最初のプロジェクトを作成
              </Button>
            </div>
          )}

          {/* プロジェクト作成・編集ドロワー */}
          <ProjectCreationDrawer
            isOpen={creationDrawerOpen}
            onClose={handleCreationDrawerClose}
            editingProject={editingProject}
            onDetailTaskMasterOpen={handleDetailTaskMasterOpen}
          />

          {/** プロジェクト詳細ドロワー */}
          {selectedProject && (
            <ProjectDetailDrawer
              isOpen={detailDrawerOpen}
              onClose={handleDetailDrawerClose}
              selectedProject={selectedProject}
            />
          )}

          {/** タスクマスタ詳細ダイアログ */}
          {detailTaskMasterTarget && (
            <TaskMasterDetailDialog
              open={detailTaskMasterOpen}
              onClose={handleDetailTaskMasterClose}
              target={detailTaskMasterTarget}
              getUserName={getUserName}
            />
          )}

          {/* プロジェクトコンプリート確認ダイアログ */}
          <AlertDialog open={completeConfirmOpen} onOpenChange={setCompleteConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>プロジェクトコンプリート</AlertDialogTitle>
                <AlertDialogDescription>
                  プロジェクト「{completeTarget?.projectName}」を完了にしますか？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={confirmComplete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  完了
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* 削除確認ダイアログ */}
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>プロジェクト削除の確認</AlertDialogTitle>
                <AlertDialogDescription>
                  「{deleteTarget?.projectName}」とそれに関連するすべてのタスクを削除しますか？この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}