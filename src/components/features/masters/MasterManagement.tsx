import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PhaseGroupForm } from './form/PhaseGroupForm';
import { PhaseForm } from './form/PhaseForm';
import { TaskMasterForm } from './form/TaskMasterForm';
import { PhaseGroup, Phase, TaskMaster, MasterDataResult } from '../../../types';
import { MasterTreeView } from './tree-view/MasterTreeView';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';
import { useMaster } from '@/hooks/data/use-master';

export function MasterManagement() {
  // const { dispatch } = useApp();
  const {
    phaseGroups,
    phases,
    taskMasters,
    loading,
    fecthAllMasters,
    deletePhaseGroup
  } = useMaster();
  // const { state: authState } = useAuth();
  const { isMobile } = useResponsive();

  // 一覧の表示形式
  // const [viewType, setViewType] = useState<'card' | 'tree'>('card');

  // フォーム状態
  const [phaseGroupFormOpen, setPhaseGroupFormOpen] = useState(false);
  const [phaseFormOpen, setPhaseFormOpen] = useState(false);
  const [taskMasterFormOpen, setTaskMasterFormOpen] = useState(false);

  // 追加対象
  const [parentGroupUid, setParentGroupUid] = useState<string>('');
  const [parentPhaseUid, setParentPhaseUid] = useState<string>('');

  // 編集対象
  const [editingPhaseGroup, setEditingPhaseGroup] = useState<PhaseGroup | null>(null);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [editingTaskMaster, setEditingTaskMaster] = useState<TaskMaster | null>(null);

  // 削除確認
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'phaseGroup' | 'phase' | 'taskMaster'; uid: string; name: string } | null>(null);

  // uidからtypeとdataを取得
  function getMasterDataWithType(uid: string): MasterDataResult {

    if (uid.startsWith('pg-')) {
      const data = phaseGroups.find(g => g.uid === uid);
      return data ? { type: 'phaseGroup', data } : { type: 'none', data: null };
    }
    else if (uid.startsWith('p-')) {
      const data = phases.find(p => p.uid === uid);
      return data ? { type: 'phase', data } : { type: 'none', data: null };
    }
    else if (uid.startsWith('tm-')) {
      const data = taskMasters.find(t => t.uid === uid);
      return data ? { type: 'taskMaster', data } : { type: 'none', data: null };
    }
    return { type: 'none', data: null };
  }

  const handleEdit = (type: 'phaseGroup' | 'phase' | 'taskMaster', item: PhaseGroup | Phase | TaskMaster) => {
    console.log('edit', item);
    switch (type) {
      case 'phaseGroup':
        setEditingPhaseGroup(item as PhaseGroup);
        setPhaseGroupFormOpen(true);
        break;
      case 'phase':
        setEditingPhase(item as Phase);
        setPhaseFormOpen(true);
        break;
      case 'taskMaster':
        setEditingTaskMaster(item as TaskMaster);
        setTaskMasterFormOpen(true);
        break;
    }
  };

  const handleDelete = (type: 'phaseGroup' | 'phase' | 'taskMaster', uid: string, name: string) => {
    setDeleteTarget({ type, uid, name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    switch (deleteTarget.type) {
      case 'phaseGroup':
        deletePhaseGroup(deleteTarget.uid);
        break;
      case 'phase':
        // dispatch({ type: 'DELETE_PHASE', payload: deleteTarget.uid });
        break;
      case 'taskMaster':
        // dispatch({ type: 'DELETE_TASK_MASTER', payload: deleteTarget.uid });
        break;
    }

    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  // 開くフォームのタイプと親のuidを渡す
  const handleFormOpen = (openType: 'phaseGroup' | 'phase' | 'taskMaster', parentUid: string) => {
    console.log('add', parentUid);
    switch (openType) {
      case 'phaseGroup':
        setParentGroupUid(parentUid);
        setPhaseGroupFormOpen(true);
        return;
      case 'phase':
        setParentGroupUid(parentUid);
        setPhaseFormOpen(true);
        return;
      case 'taskMaster':
        setParentPhaseUid(parentUid);
        setTaskMasterFormOpen(true);
        return;
      default:
        return;
    }
  };

  const handleFormClose = (type: 'phaseGroup' | 'phase' | 'taskMaster') => {
    switch (type) {
      case 'phaseGroup':
        setPhaseGroupFormOpen(false);
        setEditingPhaseGroup(null);
        setParentGroupUid('');
        break;
      case 'phase':
        setPhaseFormOpen(false);
        setEditingPhase(null);
        setParentPhaseUid('');
        break;
      case 'taskMaster':
        setTaskMasterFormOpen(false);
        setEditingTaskMaster(null);
        break;
    }
  };

  useEffect(() => {
    fecthAllMasters();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className={cn(
        "flex items-center justify-between flex-shrink-0",
        'h-12'
      )}>
        <h2 className={cn("font-bold", isMobile ? "text-xl px-2" : "text-2xl")}>マスタ管理</h2>
        {/* <ToggleGroup type="single" value={viewType} onValueChange={(v) => v && setViewType(v as 'card' | 'tree')}>
          <ToggleGroupItem value="card" aria-label="カード">
            <StickyNote className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="tree" aria-label="ツリー">
            <FolderTree className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup> */}
      </div>

      <div className="flex-1 overflow-hidden">
        {/* {viewType === 'card' ? (
          <MasterCardView onFormOpen={handleFormOpen} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <MasterTreeView getMasterDataWithType={getMasterDataWithType} onFormOpen={handleFormOpen} onEdit={handleEdit} onDelete={handleDelete} />
        )} */}
        <MasterTreeView getMasterDataWithType={getMasterDataWithType} onFormOpen={handleFormOpen} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      {/* フォーム */}
      <PhaseGroupForm
        isOpen={phaseGroupFormOpen}
        onClose={() => handleFormClose('phaseGroup')}
        editingPhaseGroup={editingPhaseGroup}
        parentGroupUid={parentGroupUid}
      />

      <PhaseForm
        isOpen={phaseFormOpen}
        onClose={() => handleFormClose('phase')}
        editingPhase={editingPhase}
        parentGroupUid={parentGroupUid}
      />

      <TaskMasterForm
        isOpen={taskMasterFormOpen}
        onClose={() => handleFormClose('taskMaster')}
        editingTaskMaster={editingTaskMaster}
        parentPhaseUid={parentPhaseUid}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除の確認</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.name}」を削除しますか？この操作は取り消せません。
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
  );
}