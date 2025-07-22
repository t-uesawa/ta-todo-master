import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phase, TaskMaster } from '../../../../types';
import { useMaster } from '@/hooks/data/use-master';
import { toast } from 'sonner';

interface TaskMasterFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTaskMaster?: TaskMaster | null;
  parentPhaseUid: string;
}

export function TaskMasterForm({ isOpen, onClose, editingTaskMaster, parentPhaseUid }: TaskMasterFormProps) {
  const { phaseGroups, phases, loading, addTask, updateTask } = useMaster();

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [phaseUid, setPhaseUid] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!taskName.trim()) throw new Error('タスクマスタ名が入力されていません');
      if (!phaseUid) throw new Error('フェーズが選択されていません');

      if (editingTaskMaster) {
        const newTaskMaster: TaskMaster = {
          ...editingTaskMaster,
          taskName: taskName.trim(),
          taskDescription: taskDescription.trim() || undefined,
          phaseUid,
        };
        await updateTask(editingTaskMaster.uid, newTaskMaster);
      } else {
        const newTaskMaster = {
          phaseUid,
          taskName: taskName.trim(),
          taskDescription: taskDescription.trim() || undefined,
        };
        await addTask(newTaskMaster);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'フェーズグループの更新に失敗しました';
      toast.error('失敗!', {
        description: errMsg,
      });
      return;

    }

    setTaskName('');
    setTaskDescription('');
    setPhaseUid('');
    onClose();
  };

  const handleClose = () => {
    setTaskName(editingTaskMaster?.taskName || '');
    setTaskDescription(editingTaskMaster?.taskDescription || '');
    setPhaseUid(editingTaskMaster?.phaseUid || parentPhaseUid);
    onClose();
  };

  const getPhaseDisplayName = (phase: Phase) => {
    const phaseGroup = phaseGroups.find(pg => pg.uid === phase.parentGroupUid);
    return `${phaseGroup?.groupName || '不明'} > ${phase.phaseName}`;
  };

  useEffect(() => {
    if (parentPhaseUid) {
      setPhaseUid(parentPhaseUid);
    }

    if (editingTaskMaster) {
      setPhaseUid(editingTaskMaster.phaseUid);
      setTaskName(editingTaskMaster.taskName);
      setTaskDescription(editingTaskMaster.taskDescription ?? '');
    }
  }, [parentPhaseUid, editingTaskMaster]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingTaskMaster ? 'タスクマスタ編集' : '新規タスクマスタ'}
          </DialogTitle>
          <DialogDescription>
            タスクマスタの情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">タスク名</Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                lang='ja'
                type='text'
                placeholder="タスク名を入力..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">説明</Label>
              <Textarea
                id="taskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                lang='ja'
                placeholder="タスクの説明を入力..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase">フェーズ</Label>
              <Select value={phaseUid} onValueChange={setPhaseUid} required>
                <SelectTrigger>
                  <SelectValue placeholder="フェーズを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {phases.map(phase => (
                    <SelectItem key={phase.uid} value={phase.uid}>
                      {getPhaseDisplayName(phase)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!taskName.trim() || !phaseUid}>
              {editingTaskMaster ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}