import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '../../../../contexts/AppContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { Phase } from '../../../../types';

interface PhaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingPhase?: Phase | null;
  parentGroupUid: string;
}

export function PhaseForm({ isOpen, onClose, editingPhase, parentGroupUid }: PhaseFormProps) {
  const { state: appState, dispatch } = useApp();
  const { state: authState } = useAuth();
  const [phaseName, setPhaseName] = useState(editingPhase?.phaseName || '');
  const [groupUid, setGroupUid] = useState(editingPhase?.parentGroupUid || parentGroupUid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phaseName.trim() || !parentGroupUid) return;

    const now = new Date();

    if (editingPhase) {
      const updatedPhase: Phase = {
        ...editingPhase,
        phaseName: phaseName.trim(),
        parentGroupUid: groupUid,
        updatedBy: authState.user?.uid || '',
        updatedAt: now
      };
      dispatch({ type: 'UPDATE_PHASE', payload: updatedPhase });
    } else {
      const newPhase: Phase = {
        uid: `p_${Date.now()}`,
        parentGroupUid: groupUid,
        phaseName: phaseName.trim(),
        createdBy: authState.user?.uid || '',
        createdAt: now,
        updatedBy: authState.user?.uid || '',
        updatedAt: now
      };
      dispatch({ type: 'ADD_PHASE', payload: newPhase });
    }

    setPhaseName('');
    setGroupUid('');
    onClose();
  };

  const handleClose = () => {
    setPhaseName(editingPhase?.phaseName || '');
    setGroupUid(editingPhase?.parentGroupUid || parentGroupUid || '');
    onClose();
  };

  useEffect(() => {
    if (parentGroupUid) {
      setGroupUid(parentGroupUid);
    }

    if (editingPhase) {
      setPhaseName(editingPhase.phaseName);
      setGroupUid(editingPhase.parentGroupUid);
    }
  }, [editingPhase, parentGroupUid]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPhase ? 'フェーズ編集' : '新規フェーズ'}
          </DialogTitle>
          <DialogDescription>
            フェーズの情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parentGroup">親フェーズグループ</Label>
              <Select value={groupUid} onValueChange={setGroupUid} required>
                <SelectTrigger>
                  <SelectValue placeholder="フェーズグループを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {appState.phaseGroups.map(group => (
                    <SelectItem key={group.uid} value={group.uid}>
                      {group.groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phaseName">フェーズ名</Label>
              <Input
                id="phaseName"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="フェーズ名を入力..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!phaseName.trim() || !parentGroupUid}>
              {editingPhase ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}