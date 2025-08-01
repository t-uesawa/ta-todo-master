/**
 * プロジェクト作成時のチェックボックス付きタスクツリー
 */
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { RichTreeView, TreeItemCheckbox, TreeItemContent, TreeItemDragAndDropOverlay, TreeItemGroupTransition, TreeItemIcon, TreeItemIconContainer, TreeItemProvider, TreeItemRoot, TreeViewBaseItem, useTreeItem, useTreeItemModel, UseTreeItemParameters } from '@mui/x-tree-view';
import { Folder, FolderOpen, FileText, FileQuestion, FileSearch } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import { MasterType, TreeNode } from '@/types';
import { Input } from '@/components/ui/input';

interface TaskMasterTreeViewProps {
  type: 'management' | 'preview';
  selectedTaskMasters: string[];
  onSelectionChange: (taskMasterUids: string[]) => void;
  onIconButtonClick: (masterUid: string) => void;
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
  onIconButtonClick: (itemId: string) => void;
}

const EXPANDED_ITEMS_KEY = 'tree_expanded_items';

// テキストをハイライト表示するコンポーネント
const HighlightText: React.FC<{ text: string; searchText: string }> = ({ text, searchText }) => {
  if (!searchText) return <span>{text}</span>;

  const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchText.toLowerCase() ? (
          <span key={index} className="bg-yellow-200 text-yellow-800 font-semibold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

// カスタムTreeItemコンポーネント
const CustomTreeItem = React.forwardRef(
  function CustomTreeItem(
    props: CustomTreeItemProps & { searchText: string },
    ref: React.Ref<HTMLLIElement>
  ) {
    const {
      id,
      itemId,
      label,
      disabled,
      children,
      onIconButtonClick,
      searchText,
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

    // 子にtaskMaster要素を持っていればtureを返す関数
    function containsTaskMaster(nodes: TreeNode[]): boolean {
      const hasTaskMaster = (node: TreeNode): boolean => {
        if (node.type === 'task') {
          return true;
        }
        if (node.children) {
          return node.children.some(hasTaskMaster); // 子にもいるかチェック
        }
        return false;
      };

      return nodes.some(hasTaskMaster); // 全体を走査して1件でもあれば true
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
                {((item.children && containsTaskMaster(item.children)) || item.type === 'task') &&
                  <TreeItemCheckbox size='small' {...getCheckboxProps()} />
                }
                {getStartIcon(item.type, status.expandable && status.expanded)}
                <div>
                  <div>
                    <div className='text-sm' {...getLabelProps()}>
                      <HighlightText text={item.label} searchText={searchText} />
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500 truncate max-w-[160px]">
                        <HighlightText text={item.description} searchText={searchText} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event?.stopPropagation();
                    onIconButtonClick(itemId);
                  }}
                >
                  {item.type === 'task' && <FileSearch className="h-4 w-4 text-gray-600" />}
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
  selectedTaskMasters,
  onSelectionChange,
  onIconButtonClick
}: TaskMasterTreeViewProps) {
  const { state } = useApp();

  const [searchText, setSearchText] = useState<string>('');
  // 展開中のアイテム
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem(EXPANDED_ITEMS_KEY);
    try {
      const parsed = JSON.parse(saved ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse expandedItems from localStorage', e);
      return [];
    }
  });
  const isExpandingRef = useRef(false);

  // 検索条件に一致するかチェック
  const isMatchingItem = useCallback((label: string, searchTerm: string): boolean => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const labelMatch = label.toLowerCase().includes(searchLower);
    // const descriptionMatch = item.description?.toLowerCase().includes(searchLower);

    return labelMatch;
  }, []);

  // 子要素に検索条件に一致するものがあるかチェック
  const hasMatchingChildren = useCallback((children: TreeNode[], searchTerm: string): boolean => {
    if (!children || children.length === 0) return false;

    return children.some(child => {
      if (isMatchingItem(child.label, searchTerm)) return true;
      if (child.children) {
        return hasMatchingChildren(child.children, searchTerm);
      }
      return false;
    });
  }, [isMatchingItem]);

  // ツリーデータをフィルタリング
  const filteredTreeData: TreeNode[] = useMemo(() => {
    const build = () => {
      // 全グループノードをマップに構築
      const groupMap = new Map<string, TreeNode>();

      for (const g of state.phaseGroups) {
        groupMap.set(g.uid, {
          id: g.uid,
          label: g.groupName,
          children: [],
          type: 'group',
        });
      }

      // 各フェーズとタスクを対応するグループに割り当て
      for (const ph of state.phases) {
        const phase: TreeNode = {
          id: ph.uid,
          label: ph.phaseName,
          children: [],
          type: 'phase',
        };

        const tasks = state.taskMasters.filter(t => t.phaseUid === ph.uid);
        const filteredTasks = tasks
          .map(t => ({
            id: t.uid,
            label: t.taskName,
            description: t.taskDescription,
            type: 'task' as MasterType,
            isSearchMatch: isMatchingItem(t.taskName, searchText),
          }))
          .filter(task => !searchText || task.isSearchMatch);

        const phaseMatches = isMatchingItem(ph.phaseName, searchText);
        const hasMatchingTasks = filteredTasks.length > 0;

        if (!searchText || phaseMatches || hasMatchingTasks) {
          phase.children = filteredTasks;

          const parentGroup = groupMap.get(ph.parentGroupUid);
          if (parentGroup) {
            parentGroup.children!.push(phase);
          }
        }
      }

      // 子グループを親グループにネストする（再帰的ツリー構築）
      const attachGroups = () => {
        for (const g of state.phaseGroups) {
          const node = groupMap.get(g.uid);
          if (!node) continue;

          const groupMatches = isMatchingItem(g.groupName, searchText);
          const hasChildren = node.children && node.children.length > 0;

          if (!searchText || groupMatches || hasChildren) {
            if (g.parentGroupUid) {
              const parentNode = groupMap.get(g.parentGroupUid);
              if (parentNode) {
                parentNode.children!.push(node);
              }
            }
          }
        }
      };
      attachGroups();

      // 最上位グループを root に追加（親のいないグループ）
      const root: TreeNode = {
        id: 'root',
        label: 'タスクマスタ',
        children: [],
        type: 'root',
      };

      for (const g of state.phaseGroups) {
        if (!g.parentGroupUid) {
          const node = groupMap.get(g.uid);
          if (node) {
            const groupMatches = isMatchingItem(g.groupName, searchText);
            const hasChildren = node.children && node.children.length > 0;

            if (!searchText || groupMatches || hasChildren) {
              root.children!.push(node);
            }
          }
        }
      }

      return [root];
    };

    return build();
  }, [state, searchText, isMatchingItem]);

  // 検索時は自動的に展開
  const autoExpandedItems = useMemo(() => {
    if (!searchText) return expandedItems;

    const expandedIds = new Set(['root']);

    const addExpandedIds = (items: TreeNode[]) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          expandedIds.add(item.id);
          addExpandedIds(item.children);
        }
      });
    };

    addExpandedIds(filteredTreeData);
    return Array.from(expandedIds);
  }, [searchText, filteredTreeData, expandedItems]);

  // 展開状態の変更ハンドラ
  const handleExpandedItemsChange = useCallback((itemIds: string[]) => {
    if (searchText) return; // 検索中は展開状態を変更しない

    isExpandingRef.current = true;
    setExpandedItems(itemIds);

    setTimeout(() => {
      isExpandingRef.current = false;
    }, 100);
  }, [searchText]);

  // 選択状態の変更ハンドラ
  const handleSelectionChange = useCallback((itemIds: string[]) => {
    if (isExpandingRef.current) {
      return; // 展開操作中は選択変更を無視
    }

    onSelectionChange(itemIds);
  }, [onSelectionChange]);

  // 展開状態をローカルに永続化
  useEffect(() => {
    if (!searchText) {
      localStorage.setItem(EXPANDED_ITEMS_KEY, JSON.stringify(expandedItems));
    }
  }, [expandedItems, searchText]);

  // ローカルに保管してある展開状況をロード
  useEffect(() => {
    const saved = localStorage.getItem(EXPANDED_ITEMS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setExpandedItems(parsed);
        }
      } catch (e) {
        console.error('Failed to parse expanded items from localStorage', e);
      }
    }
  }, []);

  // 全て解除
  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%', maxHeight: '100vh' }}>
      <div className='flex justify-between mb-2 flex-shrink-0'>
        <div />
        <div className="flex gap-2">
          <Input
            id="serach-text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="検索..."
            required
          />
          <Button onClick={handleDeselectAll} variant="outline" size="sm">
            全て解除
          </Button>
        </div>
      </div>
      <div className="border rounded-lg flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className='p-2'>
            <RichTreeView
              items={filteredTreeData}
              selectedItems={selectedTaskMasters}
              onSelectedItemsChange={(_, newSelected) => handleSelectionChange(newSelected || '')}
              expandedItems={autoExpandedItems}
              onExpandedItemsChange={(_, newExpanded) => handleExpandedItemsChange(newExpanded)}
              checkboxSelection
              multiSelect
              selectionPropagation={{
                parents: true,
                descendants: true
              }}
              slots={{
                item: (props) => (
                  <CustomTreeItem
                    {...props}
                    onIconButtonClick={onIconButtonClick}
                    searchText={searchText}
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