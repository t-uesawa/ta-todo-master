import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PhaseGroup } from '../../../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaster } from '@/hooks/data/use-master';
import { toast } from 'sonner';
import { useResponsive } from '@/hooks/useResponsive';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';

interface PhaseGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingPhaseGroup?: PhaseGroup | null;
  parentGroupUid: string;
}

export function PhaseGroupForm({ isOpen, onClose, editingPhaseGroup, parentGroupUid }: PhaseGroupFormProps) {
  const { phaseGroups, loading, addPhaseGroup, updatePhaseGroup } = useMaster();
  const { isMobile } = useResponsive();

  const [groupName, setGroupName] = useState<string>('');
  const [groupUid, setGroupUid] = useState<string>(editingPhaseGroup?.parentGroupUid || parentGroupUid);
  const [groupMemo, setGroupMemo] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!groupName.trim()) throw new Error('グループ名が入力されていません');

      if (editingPhaseGroup) {
        const newPhaseGroup: PhaseGroup = {
          ...editingPhaseGroup,
          groupName: groupName.trim(),
          parentGroupUid: groupUid,
          memo: groupMemo,
        };
        await updatePhaseGroup(editingPhaseGroup.uid, newPhaseGroup);
      } else {
        const newPhaseGroup = {
          groupName: groupName.trim(),
          parentGroupUid: groupUid,
          memo: groupMemo,
        };
        await addPhaseGroup(newPhaseGroup);
      }

      toast.success('成功!', {
        description: '正常に更新が完了しました'
      });

      setGroupName('');
      setGroupUid('');
      setGroupMemo('');
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
    setGroupMemo(editingPhaseGroup?.memo || '');
    onClose();
  };

  useEffect(() => {
    if (parentGroupUid) {
      setGroupUid(parentGroupUid);
    }

    if (editingPhaseGroup) {
      setGroupName(editingPhaseGroup.groupName);
      setGroupUid(editingPhaseGroup.parentGroupUid || '');
      setGroupMemo(editingPhaseGroup.memo || '');
    }
  }, [editingPhaseGroup, parentGroupUid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return !isMobile ? (
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
                lang='ja'
                autoComplete='off'
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

            <div className="space-y-2">
              <Label htmlFor="projectName">メモ</Label>
              <Textarea
                id="projectName"
                value={groupMemo}
                onChange={(e) => setGroupMemo(e.target.value)}
                placeholder="プロジェクトのメモを入力..."
                rows={4}
                lang='ja'
                autoComplete='off'
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
  ) : (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="px-4 pb-4">
        <DrawerHeader>
          <DrawerTitle>
            {editingPhaseGroup ? 'フェーズグループ編集' : '新規フェーズグループ'}
          </DrawerTitle>
          <DrawerDescription>
            フェーズグループの情報を入力してください。
          </DrawerDescription>
        </DrawerHeader>
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
                lang='ja'
                autoComplete='off'
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

            <div className="space-y-2">
              <Label htmlFor="projectName">メモ</Label>
              <Textarea
                id="projectName"
                value={groupMemo}
                onChange={(e) => setGroupMemo(e.target.value)}
                placeholder="プロジェクトのメモを入力..."
                rows={4}
                lang='ja'
                autoComplete='off'
              />
            </div>
          </div>
          <DrawerFooter>
            <Button type="submit" disabled={!groupName.trim()}>
              {editingPhaseGroup ? '更新' : '作成'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}