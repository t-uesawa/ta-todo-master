/**
 * プロジェクト作成時のチェックボックス付きタスクツリー
 */
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { RichTreeView, TreeItemCheckbox, TreeItemContent, TreeItemDragAndDropOverlay, TreeItemGroupTransition, TreeItemIcon, TreeItemIconContainer, TreeItemLabel, TreeItemProvider, TreeItemRoot, TreeViewBaseItem, useTreeItem, useTreeItemModel, UseTreeItemParameters } from '@mui/x-tree-view';
import { Folder, FolderOpen, FileText, FileQuestion, FileSearch, Plus } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import { IconButtonType, MasterType } from '@/types';

interface TaskMasterTreeViewProps {
  type: 'management' | 'preview';
  selectedTaskMasters: string[];
  onSelectionChange: (taskMasterUids: string[]) => void;
  onIconButtonClick: (masterUid: string, type: IconButtonType) => void;
}

interface TreeItemData extends TreeViewBaseItem {
  id: string;
  label: string;
  description?: string;
  children?: TreeItemData[];
  type: MasterType;
}

interface CustomTreeItemProps
  extends Omit<UseTreeItemParameters, 'rootRef'>,
  Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
  onIconButtonClick: (itemId: string, type: IconButtonType) => void;
}

// カスタムTreeItemコンポーネント
const CustomTreeItem = React.forwardRef(
  function CustomTreeItem(
    props: CustomTreeItemProps,
    ref: React.Ref<HTMLLIElement>
  ) {
    const {
      id,
      itemId,
      label,
      disabled,
      children,
      onIconButtonClick,
      ...other
    } = props;

    const {
      getContextProviderProps,
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
    } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });

    const item = useTreeItemModel<TreeItemData>(itemId)!;

    // アイテムタイプに応じたSTARTアイコンを取得
    const getStartIcon = (type: MasterType, isExpanded: boolean) => {
      switch (type) {
        case 'root':
          return isExpanded ? <FolderOpen className="h-4 w-4 text-blue-600" /> : <Folder className="h-4 w-4 text-blue-600" />;
        case 'group':
          return isExpanded ? <FolderOpen className="h-4 w-4 text-green-600" /> : <Folder className="h-4 w-4 text-green-600" />;
        case 'phase':
          return isExpanded ? <FolderOpen className="h-4 w-4 text-orange-600" /> : <Folder className="h-4 w-4 text-orange-600" />;
        case 'task':
          return <FileText className="h-4 w-4 text-gray-600" />;
        default:
          return <FileQuestion className="h-4 w-4 text-gray-400" />;
      }
    };

    // タイプに応じた詳細ボタンの取得
    const getFileSearchIcon = (type: MasterType) => {
      switch (type) {
        case 'root':
        case 'task':
          return <div></div>;
        case 'group':
        case 'phase':
          return <FileSearch className="h-4 w-4 text-gray-600" />;
        default:
          return;
      }
    };

    const getPlusIcon = (type: MasterType) => {
      switch (type) {
        case 'root':
        case 'group':
        case 'phase':
          return <Plus className="h-4 w-4 text-gray-600" />;
        default:
          return;
      }
    }

    return (
      <TreeItemProvider {...getContextProviderProps()}>
        <TreeItemRoot {...getRootProps(other)}>
          <TreeItemContent {...getContentProps()}>
            <TreeItemIconContainer {...getIconContainerProps()}>
              <TreeItemIcon status={status} />
            </TreeItemIconContainer>
            <div className="flex justify-between items-center w-full gap-2">
              <div className='flex items-center gap-2'>
                <TreeItemCheckbox {...getCheckboxProps()} />
                {getStartIcon(item.type, status.expandable && status.expanded)}
                <div>
                  <TreeItemLabel {...getLabelProps()} />
                  {item.description && (
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event?.stopPropagation();
                    onIconButtonClick(itemId, 'detail');
                  }}
                >
                  {getFileSearchIcon(item.type)}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event?.stopPropagation();
                    onIconButtonClick(itemId, 'add');
                  }}
                >
                  {getPlusIcon(item.type)}
                </IconButton>
              </div>
            </div>
            <TreeItemDragAndDropOverlay {...getDragAndDropOverlayProps()} />
          </TreeItemContent>
          {children && <TreeItemGroupTransition {...getGroupTransitionProps()} />}
        </TreeItemRoot>
      </TreeItemProvider>
    );
  }
);

export function TaskMasterTreeView({
  type,
  selectedTaskMasters,
  onSelectionChange,
  onIconButtonClick
}: TaskMasterTreeViewProps) {
  const { state } = useApp();

  const [expandedItems, setExpandedItems] = useState<string[]>(['root']);
  const isExpandingRef = useRef(false);

  // 全構造を items にして useMemo でメモ化
  const treeData: TreeItemData[] = useMemo(() => {
    const build = () => {
      const root: TreeItemData = { id: 'root', label: 'タスクマスタ', children: [], type: 'root' };
      for (const g of state.phaseGroups) {
        const group: TreeItemData = { id: g.uid, label: g.groupName, children: [], type: 'group' };
        const phases = state.phases.filter(p => p.parentGroupUid === g.uid);
        for (const ph of phases) {
          const phase: TreeItemData = { id: ph.uid, label: ph.phaseName, children: [], type: 'phase' };
          const tasks = state.taskMasters.filter(t => t.phaseUid === ph.uid);
          phase.children = tasks.map(t => ({ id: t.uid, label: t.taskName, description: t.taskDescription, type: 'task' }));
          group.children!.push(phase);
        }
        root.children!.push(group);
      }
      return [root];
    };
    return build();
  }, [state]);

  // すべてのアイテムIDを取得
  const getAllItemIds = (items: TreeItemData[]): string[] => {
    const ids: string[] = [];
    items.forEach(item => {
      ids.push(item.id);
      if (item.children) {
        ids.push(...getAllItemIds(item.children));
      }
    });
    return ids;
  };

  // 全て選択
  const handleSelectAll = () => {
    const allIds = getAllItemIds(treeData);
    onSelectionChange(allIds);
  };

  // 全て解除
  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  // 展開状態の変更ハンドラ
  const handleExpandedItemsChange = useCallback((itemIds: string[]) => {
    isExpandingRef.current = true;
    setExpandedItems(itemIds);

    setTimeout(() => {
      isExpandingRef.current = false;
    }, 100);
  }, []);

  // 選択状態の変更ハンドラ
  const handleSelectionChange = useCallback((itemIds: string[]) => {
    if (isExpandingRef.current) {
      return; // 展開操作中は選択変更を無視
    }
    console.log(true);
    onSelectionChange(itemIds);
  }, []);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%', maxHeight: '100vh' }}>
      <div className='flex justify-between mb-2 flex-shrink-0'>
        <div />
        {type === 'preview' && (
          <div className="flex gap-2">
            <Button onClick={handleSelectAll} variant="outline" size="sm">
              全て選択
            </Button>
            <Button onClick={handleDeselectAll} variant="outline" size="sm">
              全て解除
            </Button>
          </div>
        )}
      </div>
      <div className="border rounded-lg flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className='p-2'>
            <RichTreeView
              items={treeData}
              selectedItems={selectedTaskMasters}
              onSelectedItemsChange={(_, newSelected) => newSelected && handleSelectionChange(Array.isArray(newSelected) ? newSelected : [newSelected])}
              expandedItems={expandedItems}
              onExpandedItemsChange={(_, newExpanded) => handleExpandedItemsChange(newExpanded)}
              checkboxSelection={type === 'preview'}
              multiSelect={type === 'preview'}
              selectionPropagation={{
                parents: type === 'preview',
                descendants: type === 'preview'
              }}
              slots={{
                item: (props) => (
                  <CustomTreeItem
                    {...props}
                    onIconButtonClick={onIconButtonClick}
                  />
                )
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};