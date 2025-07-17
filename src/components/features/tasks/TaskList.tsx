import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Search, CheckSquare, Building, User, Calendar, Edit, AlertCircle, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Task, TaskFilter } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface SortConfig {
  key: keyof Task | null;
  direction: 'asc' | 'desc';
}

interface SortableHeaderProps {
  sortKey: keyof Task;
  children: React.ReactNode;
  onSort: (key: keyof Task) => void;
  sortConfig: SortConfig;
}

export function TaskList() {
  const { state: appState, dispatch } = useApp();
  const { state: authState } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilter, setLocalFilter] = useState<TaskFilter>(appState.taskFilter);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });

  const filteredTasks = useMemo(() => {
    let filtered = appState.tasks;

    if (appState.taskFilter.status) {
      filtered = filtered.filter(task => task.status === appState.taskFilter.status);
    }

    if (appState.taskFilter.assigneeUid) {
      filtered = filtered.filter(task => task.assigneeUid === appState.taskFilter.assigneeUid);
    }

    if (appState.taskFilter.projectUid) {
      filtered = filtered.filter(task => task.projectUid === appState.taskFilter.projectUid);
    }

    if (appState.taskFilter.freeText) {
      const searchText = appState.taskFilter.freeText.toLowerCase();
      filtered = filtered.filter(task => {
        const taskMaster = appState.taskMasters.find(tm => tm.uid === task.taskMasterUid);
        const project = appState.projects.find(p => p.uid === task.projectUid);
        const assignee = authState.users.find(u => u.uid === task.assigneeUid);

        return (
          taskMaster?.taskName.toLowerCase().includes(searchText) ||
          taskMaster?.taskDescription?.toLowerCase().includes(searchText) ||
          project?.projectName.toLowerCase().includes(searchText) ||
          assignee?.name.toLowerCase().includes(searchText)
        );
      });
    }

    return filtered;
  }, [appState.tasks, appState.taskFilter, appState.taskMasters, appState.projects, authState.users]);

  // ソート機能
  const sortedTasks = useMemo(() => {
    const sortableTasks = filteredTasks;
    if (sortConfig.key !== null) {
      sortableTasks.sort((a, b) => {
        const key = sortConfig.key as keyof Task;
        let aValue: Date | string | number = a[key]!;
        let bValue: Date | string | number = b[key]!;

        // 日付の場合は Date オブジェクトに変換
        if (sortConfig.key === 'dueDate') {
          aValue = new Date(aValue as string);
          bValue = new Date(bValue as string);
        }

        // ステータスの場合は優先度でソート
        if (sortConfig.key === 'status') {
          const statusOrder: Record<Task['status'], number> = {
            'not_started': 0,
            'in_progress': 1,
            'completed': 2
          };
          aValue = statusOrder[aValue as Task['status']];
          bValue = statusOrder[bValue as Task['status']];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTasks;
  }, [filteredTasks, sortConfig]);

  // ソート実行
  const handleSort = (key: keyof Task): void => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ソートアイコンの表示
  const getSortIcon = (columnKey: keyof Task): React.ReactNode => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="h-4 w-4" /> :
      <ChevronDown className="h-4 w-4" />;
  };

  // ソート可能なヘッダーコンポーネント
  const SortableHeader: React.FC<SortableHeaderProps> = ({ sortKey, children, onSort }) => (
    <button
      className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded transition-colors w-full text-left"
      onClick={() => onSort(sortKey)}
    >
      {children}
      {getSortIcon(sortKey)}
    </button>
  );

  const applyFilter = () => {
    dispatch({ type: 'SET_TASK_FILTER', payload: localFilter });
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    const emptyFilter = {};
    setLocalFilter(emptyFilter);
    dispatch({ type: 'SET_TASK_FILTER', payload: emptyFilter });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="secondary">未着手</Badge>;
      case 'in_progress':
        return <Badge variant="default">進行中</Badge>;
      case 'completed':
        return <Badge variant="outline">完了</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTaskData = (task: Task) => {
    const taskMaster = appState.taskMasters.find(tm => tm.uid === task.taskMasterUid);
    const project = appState.projects.find(p => p.uid === task.projectUid);
    const assignee = authState.users.find(u => u.uid === task.assigneeUid);

    return {
      taskName: taskMaster?.taskName || '不明なタスク',
      projectName: project?.projectName || '不明なプロジェクト',
      assigneeName: assignee?.name || '不明なユーザー',
    };
  }

  const handleStatusChange = (task: Task, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    const updatedTask: Task = {
      ...task,
      status: newStatus,
      updatedBy: authState.user?.uid || '',
      updatedAt: new Date()
    };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  };

  const isOverdue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const handleMobileSortChange = (value: string): void => {
    if (value && value in appState.tasks[0]) {
      handleSort(value as keyof Task);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">タスク一覧</h2>
        <div className="flex items-center gap-2">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                フィルター
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>フィルター</SheetTitle>
                <SheetDescription>
                  タスクをフィルタリングして表示します。
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ステータス</label>
                  <Select value={localFilter.status || ''} onValueChange={(value) =>
                    setLocalFilter({ ...localFilter, status: value === 'all' ? undefined : value as TaskFilter['status'] || undefined })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="not_started">未着手</SelectItem>
                      <SelectItem value="in_progress">進行中</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">担当者</label>
                  <Select value={localFilter.assigneeUid || ''} onValueChange={(value) =>
                    setLocalFilter({ ...localFilter, assigneeUid: value === 'all' ? undefined : value || undefined })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {authState.users.map(user => (
                        <SelectItem key={user.uid} value={user.uid}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">プロジェクト</label>
                  <Select value={localFilter.projectUid || ''} onValueChange={(value) =>
                    setLocalFilter({ ...localFilter, projectUid: value === 'all' ? undefined : value || undefined })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {appState.projects.map(project => (
                        <SelectItem key={project.uid} value={project.uid}>
                          {project.projectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">フリーテキスト検索</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="タスク名、説明、プロジェクト名で検索..."
                      value={localFilter.freeText || ''}
                      onChange={(e) => setLocalFilter({ ...localFilter, freeText: e.target.value || undefined })}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={applyFilter} className="flex-1">
                    適用
                  </Button>
                  <Button variant="outline" onClick={clearFilter} className="flex-1">
                    クリア
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            タスク ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SortableHeader sortKey="taskMasterUid" onSort={handleSort} sortConfig={sortConfig}>
                          タスク名
                        </SortableHeader>
                      </TableHead>
                      <TableHead>
                        <SortableHeader sortKey="projectUid" onSort={handleSort} sortConfig={sortConfig}>
                          プロジェクト
                        </SortableHeader>
                      </TableHead>
                      <TableHead>
                        <SortableHeader sortKey="status" onSort={handleSort} sortConfig={sortConfig}>
                          ステータス
                        </SortableHeader>
                      </TableHead>
                      <TableHead>
                        <SortableHeader sortKey="assigneeUid" onSort={handleSort} sortConfig={sortConfig}>
                          担当者
                        </SortableHeader>
                      </TableHead>
                      <TableHead>
                        <SortableHeader sortKey="dueDate" onSort={handleSort} sortConfig={sortConfig}>
                          期日
                        </SortableHeader>
                      </TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTasks.map(task => {
                      const taskData = getTaskData(task);
                      return (
                        <TableRow key={task.uid}>
                          <TableCell className="font-medium">
                            {taskData.taskName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              {taskData.projectName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={task.status}
                              onValueChange={(value: 'not_started' | 'in_progress' | 'completed') =>
                                handleStatusChange(task, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_started">未着手</SelectItem>
                                <SelectItem value="in_progress">進行中</SelectItem>
                                <SelectItem value="completed">完了</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {taskData.assigneeName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {format(task.dueDate, 'yyyy/MM/dd', { locale: ja })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* モバイル用カードレイアウト */}
            <div className="block md:hidden space-y-4">
              {/* モバイル用ソートボタン */}
              <div className="mb-4 flex flex-wrap gap-2">
                <Select value={sortConfig.key || ''} onValueChange={handleMobileSortChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="ソート" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">タスク名</SelectItem>
                    <SelectItem value="project">プロジェクト</SelectItem>
                    <SelectItem value="status">ステータス</SelectItem>
                    <SelectItem value="assignee">担当者</SelectItem>
                    <SelectItem value="dueDate">期日</SelectItem>
                  </SelectContent>
                </Select>
                {sortConfig.key && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort(sortConfig.key!)}
                    className="flex items-center gap-1"
                  >
                    {sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {sortConfig.direction === 'asc' ? '昇順' : '降順'}
                  </Button>
                )}
              </div>
              {sortedTasks.map(task => {
                const taskData = getTaskData(task);
                return (
                  <Card key={task.uid} className="p-4">
                    <div className="space-y-3">
                      {/* タスク名とステータス */}
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="font-medium text-sm leading-5 flex-1">
                          {taskData.taskName}
                        </h3>
                        {getStatusBadge(task.status)}
                      </div>

                      {/* プロジェクト */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{taskData.projectName}</span>
                      </div>

                      {/* 担当者と期日 */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{taskData.assigneeName}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'}`}>
                          {isOverdue(task.dueDate) ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}
                          <span>{format(task.dueDate, 'yyyy/MM/dd', { locale: ja })}</span>
                        </div>
                      </div>

                      {/* ステータス変更と編集ボタン */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Select
                          value={task.status}
                          onValueChange={(value: 'not_started' | 'in_progress' | 'completed') => handleStatusChange(task, value)}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">未着手</SelectItem>
                            <SelectItem value="in_progress">進行中</SelectItem>
                            <SelectItem value="completed">完了</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">条件に一致するタスクが見つかりません。</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}