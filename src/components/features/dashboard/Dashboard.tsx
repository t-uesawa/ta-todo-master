import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';

export function Dashboard() {
  const { state: appState } = useApp();
  const { state: authState } = useAuth();

  const taskStats = {
    total: appState.tasks.length,
    completed: appState.tasks.filter(t => t.status === 'completed').length,
    inProgress: appState.tasks.filter(t => t.status === 'in_progress').length,
    notStarted: appState.tasks.filter(t => t.status === 'not_started').length
  };

  const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

  const myTasks = appState.tasks.filter(t => t.assigneeUid === authState.user?.uid);
  const myTaskStats = {
    total: myTasks.length,
    completed: myTasks.filter(t => t.status === 'completed').length,
    inProgress: myTasks.filter(t => t.status === 'in_progress').length,
    notStarted: myTasks.filter(t => t.status === 'not_started').length
  };

  const overdueTasks = appState.tasks.filter(t =>
    t.status !== 'completed' && new Date(t.dueDate) < new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ダッシュボード</h2>
        <Badge variant="outline">
          {authState.user?.name} - {authState.user?.department}
        </Badge>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              総タスク数
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">
              全プロジェクト
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              完了率
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              進行中
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              現在進行中のタスク
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              期限切れ
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              期限を過ぎたタスク
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* マイタスク */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              マイタスク
            </CardTitle>
            <CardDescription>
              あなたに割り当てられたタスクの状況
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">完了</span>
                <span className="text-sm text-muted-foreground">
                  {myTaskStats.completed}/{myTaskStats.total}
                </span>
              </div>
              <Progress value={myTaskStats.total > 0 ? (myTaskStats.completed / myTaskStats.total) * 100 : 0} />

              <div className="flex justify-between text-sm">
                <span>未着手: {myTaskStats.notStarted}</span>
                <span>進行中: {myTaskStats.inProgress}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* プロジェクト統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              プロジェクト統計
            </CardTitle>
            <CardDescription>
              進行中のプロジェクト概要
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">総プロジェクト数</span>
                <span className="text-2xl font-bold">{appState.projects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">建設工事</span>
                <span className="text-sm text-muted-foreground">
                  {appState.projects.filter(p => p.projectType === 'construction').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">一般プロジェクト</span>
                <span className="text-sm text-muted-foreground">
                  {appState.projects.filter(p => p.projectType === 'general').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}