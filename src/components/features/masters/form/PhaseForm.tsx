import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phase } from '../../../../types';
import { useMaster } from '@/hooks/data/use-master';
import { toast } from 'sonner';
import { useResponsive } from '@/hooks/useResponsive';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';

interface PhaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingPhase?: Phase | null;
  parentGroupUid: string;
}

export function PhaseForm({ isOpen, onClose, editingPhase, parentGroupUid }: PhaseFormProps) {
  const { phaseGroups, loading, addPhase, updatePhase } = useMaster();
  const { isMobile } = useResponsive();

  const [phaseName, setPhaseName] = useState(editingPhase?.phaseName || '');
  const [groupUid, setGroupUid] = useState(editingPhase?.parentGroupUid || parentGroupUid);
  const [memo, setMemo] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!phaseName.trim()) throw new Error('フェーズ名が入力されていません');
      if (!parentGroupUid) throw new Error('フェーズグループの選択は必須です');

      if (editingPhase) {
        const newPhase: Phase = {
          ...editingPhase,
          phaseName: phaseName.trim(),
          parentGroupUid: groupUid,
          memo,
        };
        await updatePhase(editingPhase.uid, newPhase);
      } else {
        const newPhase = {
          parentGroupUid: groupUid,
          phaseName: phaseName.trim(),
          memo,
        };
        await addPhase(newPhase);
      }

      toast.success('成功!', {
        description: '正常に更新が完了しました'
      });

      setPhaseName('');
      setGroupUid('');
      setMemo('');
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'フェーズの更新に失敗しました';
      toast.error('失敗!', {
        description: errMsg,
      });
      return;
    }
  };

  const handleClose = () => {
    setPhaseName(editingPhase?.phaseName || '');
    setGroupUid(editingPhase?.parentGroupUid || parentGroupUid || '');
    setMemo(editingPhase?.memo || '');
    onClose();
  };

  useEffect(() => {
    if (parentGroupUid) {
      setGroupUid(parentGroupUid);
    }

    if (editingPhase) {
      setPhaseName(editingPhase.phaseName);
      setGroupUid(editingPhase.parentGroupUid);
      setMemo(editingPhase.memo || '');
    }
  }, [editingPhase, parentGroupUid]);

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
            {editingPhase ? 'フェーズ編集' : '新規フェーズ'}
          </DialogTitle>
          <DialogDescription>
            フェーズの情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="parentGroup">親フェーズグループ</Label>
              <Select value={groupUid} onValueChange={setGroupUid} required>
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
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモを入力..."
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
            <Button type="submit" disabled={!phaseName.trim() || !parentGroupUid}>
              {editingPhase ? '更新' : '作成'}
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
            {editingPhase ? 'フェーズ編集' : '新規フェーズ'}
          </DrawerTitle>
          <DrawerDescription>
            フェーズの情報を入力してください。
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="parentGroup">親フェーズグループ</Label>
              <Select value={groupUid} onValueChange={setGroupUid} required>
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
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモを入力..."
                rows={4}
                lang='ja'
                autoComplete='off'
              />
            </div>
          </div>
          <DrawerFooter>
            <Button type="submit" disabled={!phaseName.trim() || !parentGroupUid}>
              {editingPhase ? '更新' : '作成'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}