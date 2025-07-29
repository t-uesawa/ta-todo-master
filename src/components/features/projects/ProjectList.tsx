/**
 * プロジェクト一覧メインコンポーネント
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  FolderOpen,
  Calendar,
  Building,
  User,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ProjectCreationDrawer } from './drawer/ProjectCreationDrawer';
import { Project } from '../../../types';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import { ProjectDetailDrawer } from './drawer/ProjectDetailDrawer';
import { useProject } from '@/hooks/data/use-project';
import { mockConstructions } from '@/data/mockData';

export function ProjectList() {
  const { projects, tasks, deleteProject } = useProject();
  const { state: authState } = useAuth();
  const { isMobile } = useResponsive();
  const [creationDrawerOpen, setCreationDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ uid: string; name: string } | null>(null);

  const getConstruction = (constructionUid: string) => {
    return mockConstructions.find(c => c.id === constructionUid);
  }

  const getProjectTaskCount = (projectUid: string) => {
    return tasks.filter(t => t.projectUid === projectUid).length;
  };

  const getProjectCompletedTaskCount = (projectUid: string) => {
    return tasks.filter(t => t.projectUid === projectUid && t.status === 'completed').length;
  };

  const getCreatorName = (createdBy: string) => {
    const user = authState.users.find(u => u.uid === createdBy);
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

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setCreationDrawerOpen(true);
  };

  const handleSelect = (project: Project) => {
    setSelectedProject(project);
    setDetailDrawerOpen(true);
  }

  const handleDelete = (project: Project) => {
    setDeleteTarget({ uid: project.uid, name: project.projectName });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    deleteProject(deleteTarget.uid);

    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleCreationDrawerClose = () => {
    setCreationDrawerOpen(false);
    setEditingProject(null);
  };

  const handleDetailDrawerClose = () => {
    setDetailDrawerOpen(false);
    setSelectedProject(null);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0 h-12">
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
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleSelect(project)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(project)}>
                          <Trash2 className="h-4 w-4" />
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
                        <User className="h-4 w-4 text-gray-400" />
                        <span>作成者: {getCreatorName(project.createdBy)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>作成日: {format(project.createdAt, 'yyyy/MM/dd', { locale: ja })}</span>
                      </div>
                      {construction && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>発注者: {construction.client}</span>
                        </div>
                      )}
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
          />

          {/** プロジェクト詳細ドロワー */}
          {selectedProject && (
            <ProjectDetailDrawer
              isOpen={detailDrawerOpen}
              onClose={handleDetailDrawerClose}
              selectedProject={selectedProject}
            />
          )}

          {/* 削除確認ダイアログ */}
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>プロジェクト削除の確認</AlertDialogTitle>
                <AlertDialogDescription>
                  「{deleteTarget?.name}」とそれに関連するすべてのタスクを削除しますか？この操作は取り消せません。
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