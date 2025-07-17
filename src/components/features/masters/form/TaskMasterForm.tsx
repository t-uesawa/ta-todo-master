import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '../../../../contexts/AppContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { Phase, TaskMaster } from '../../../../types';

interface TaskMasterFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTaskMaster?: TaskMaster | null;
  parentPhaseUid: string;
}

export function TaskMasterForm({ isOpen, onClose, editingTaskMaster, parentPhaseUid }: TaskMasterFormProps) {
  const { state: appState, dispatch } = useApp();
  const { state: authState } = useAuth();
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [phaseUid, setPhaseUid] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim() || !phaseUid) return;

    const now = new Date();

    if (editingTaskMaster) {
      const updatedTaskMaster: TaskMaster = {
        ...editingTaskMaster,
        taskName: taskName.trim(),
        taskDescription: taskDescription.trim() || undefined,
        phaseUid,
        updatedBy: authState.user?.uid || '',
        updatedAt: now
      };
      dispatch({ type: 'UPDATE_TASK_MASTER', payload: updatedTaskMaster });
    } else {
      const newTaskMaster: TaskMaster = {
        uid: `tm_${Date.now()}`,
        phaseUid,
        taskName: taskName.trim(),
        taskDescription: taskDescription.trim() || undefined,
        createdBy: authState.user?.uid || '',
        createdAt: now,
        updatedBy: authState.user?.uid || '',
        updatedAt: now
      };
      dispatch({ type: 'ADD_TASK_MASTER', payload: newTaskMaster });
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
    const phaseGroup = appState.phaseGroups.find(pg => pg.uid === phase.parentGroupUid);
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
              <Label htmlFor="phase">フェーズ</Label>
              <Select value={phaseUid} onValueChange={setPhaseUid} required>
                <SelectTrigger>
                  <SelectValue placeholder="フェーズを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {appState.phases.map(phase => (
                    <SelectItem key={phase.uid} value={phase.uid}>
                      {getPhaseDisplayName(phase)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskName">タスク名</Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
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
                placeholder="タスクの説明を入力..."
                rows={3}
              />
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