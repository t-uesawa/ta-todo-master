import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PhaseGroup } from '../../../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaster } from '@/hooks/data/use-master';
import { toast } from 'sonner';

interface PhaseGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingPhaseGroup?: PhaseGroup | null;
  parentGroupUid: string;
}

export function PhaseGroupForm({ isOpen, onClose, editingPhaseGroup, parentGroupUid }: PhaseGroupFormProps) {
  const { phaseGroups, loading, addPhaseGroup, updatePhaseGroup } = useMaster();

  const [groupName, setGroupName] = useState<string>('');
  const [groupUid, setGroupUid] = useState<string>(editingPhaseGroup?.parentGroupUid || parentGroupUid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!groupName.trim()) throw new Error('グループ名が入力されていません');

      if (editingPhaseGroup) {
        const newPhaseGroup: PhaseGroup = {
          ...editingPhaseGroup,
          groupName: groupName.trim(),
          parentGroupUid: groupUid,
        };
        await updatePhaseGroup(editingPhaseGroup.uid, newPhaseGroup);
      } else {
        const newPhaseGroup = {
          groupName: groupName.trim(),
          parentGroupUid: groupUid,
        };
        await addPhaseGroup(newPhaseGroup);
      }

      toast.success('成功!', {
        description: '正常に更新が完了しました'
      });

      setGroupName('');
      setGroupUid('');
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'フェーズグループの更新に失敗しました';
      toast.error('失敗!', {
        description: errMsg,
      });
      return;
    }
  };

  const handleClose = () => {
    setGroupName(editingPhaseGroup?.groupName || '');
    setGroupUid(editingPhaseGroup?.parentGroupUid || '');
    onClose();
  };

  useEffect(() => {
    if (parentGroupUid) {
      setGroupUid(parentGroupUid);
    }

    if (editingPhaseGroup) {
      setGroupName(editingPhaseGroup.groupName);
      setGroupUid(editingPhaseGroup.parentGroupUid || '');
    }
  }, [editingPhaseGroup, parentGroupUid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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

            <div className="space-y-2">
              <Label htmlFor="parentGroup">親フェーズグループ</Label>
              <Select value={groupUid} onValueChange={setGroupUid}>
                <SelectTrigger>
                  <SelectValue placeholder="フェーズグループを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {phaseGroups.map(group => (
                    <SelectItem key={group.uid} value={group.uid}>
                      {group.groupName}
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
            <Button type="submit" disabled={!groupName.trim()}>
              {editingPhaseGroup ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}