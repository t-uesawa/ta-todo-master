import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '../../../../contexts/AppContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { PhaseGroup } from '../../../../types';

interface PhaseGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingPhaseGroup?: PhaseGroup | null;
}

export function PhaseGroupForm({ isOpen, onClose, editingPhaseGroup }: PhaseGroupFormProps) {
  const { dispatch } = useApp();
  const { state: authState } = useAuth();
  const [groupName, setGroupName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) return;

    const now = new Date();

    if (editingPhaseGroup) {
      const updatedPhaseGroup: PhaseGroup = {
        ...editingPhaseGroup,
        groupName: groupName.trim(),
        updatedBy: authState.user?.uid || '',
        updatedAt: now
      };
      dispatch({ type: 'UPDATE_PHASE_GROUP', payload: updatedPhaseGroup });
    } else {
      const newPhaseGroup: PhaseGroup = {
        uid: `pg_${Date.now()}`,
        groupName: groupName.trim(),
        parentGroupUid: undefined,
        createdBy: authState.user?.uid || '',
        createdAt: now,
        updatedBy: authState.user?.uid || '',
        updatedAt: now
      };
      dispatch({ type: 'ADD_PHASE_GROUP', payload: newPhaseGroup });
    }

    setGroupName('');
    onClose();
  };

  const handleClose = () => {
    setGroupName(editingPhaseGroup?.groupName || '');
    onClose();
  };

  useEffect(() => {
    if (editingPhaseGroup) {
      setGroupName(editingPhaseGroup.groupName);
    }
  }, [editingPhaseGroup]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPhaseGroup ? 'フェーズグループ編集' : '新規フェーズグループ'}
          </DialogTitle>
          <DialogDescription>
            フェーズグループの情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">グループ名</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="フェーズグループ名を入力..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!groupName.trim()}>
              {editingPhaseGroup ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}