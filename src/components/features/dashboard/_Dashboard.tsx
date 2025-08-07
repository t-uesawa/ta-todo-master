import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckSquare,
  TrendingUp,
  Users,
  FolderOpen,
  Footprints,
  Timer
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/hooks/data/use-project';
import dayjs from 'dayjs';
import { Task, TaskFilter } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const { dispatch } = useApp();
  const { projects } = useProject();
  const { state: authState } = useAuth();

  // 総タスク数、完了率、進行中、期限切れ
  const myTaskStats = {
    totalTask: projects.reduce((sum, project) => (
      sum + project.tasks.filter(task => task.assigneeUid === authState.user?.uid).length
    ), 0),
    completed: projects.reduce((sum, project) => (sum + project.tasks.filter(task => task.assigneeUid === authState.user?.uid && task.status === 'completed').length), 0),
    inProgress: projects.reduce((sum, project) => (sum + project.tasks.filter(task => task.assigneeUid === authState.user?.uid && task.status === 'in_progress').length), 0),
    notStarted: projects.reduce((sum, project) => (sum + project.tasks.filter(task => task.assigneeUid === authState.user?.uid && task.status === 'not_started').length), 0)
  };

  // 完了率
  const myCompletionRate = myTaskStats.totalTask > 0 ? (myTaskStats.completed / myTaskStats.totalTask) * 100 : 0;

  // 期限切れ
  const myOverdueTasks: Task[] = projects.flatMap(project =>
    project.tasks.filter(task =>
      task.assigneeUid === authState.user?.uid &&
      task.status !== 'completed' &&
      dayjs(task.dueDate).isBefore(dayjs())
    )
  );

  const handleTaskPageTransition = (
    target: 'all' | 'person',
    type: 'total' | 'completed' | 'inProgress' | 'notStarted' | 'overDue'
  ) => {
    const payload: TaskFilter = {};

    if (target === 'person') {
      if (type === 'overDue') {
        payload.assigneeUid = authState.user?.uid;
      }
    }

    onPageChange('tasks');
    dispatch({
      type: 'SET_TASK_FILTER',
      payload
    });
  };

  return (
    <Tabs defaultValue='person'>
      <div className="space-y-6 p-2">
        <div className="flex items-center justify-between flex-shrink-0 h-12 my-2">
          <h2 className="text-2xl font-bold">ダッシュボード</h2>
          <TabsList>
            <TabsTrigger value='all'>全体</TabsTrigger>
            <TabsTrigger value='person'>個人</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='all'>

        </TabsContent>
        <TabsContent value='person' className='space-y-6'>
          {/* 統計カード */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  総タスク数
                </CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTaskStats.totalTask}</div>
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
                <div className="text-2xl font-bold">{myCompletionRate.toFixed(1)}%</div>
                <Progress value={myCompletionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  進行中
                </CardTitle>
                <Footprints className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTaskStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  現在進行中のタスク
                </p>
              </CardContent>
            </Card>

            <Card onClick={() => handleTaskPageTransition('person', 'overDue')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  期限切れ
                </CardTitle>
                <Timer className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{myOverdueTasks.length}</div>
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
                      {myTaskStats.completed}/{myTaskStats.totalTask}
                    </span>
                  </div>
                  <Progress value={myTaskStats.totalTask > 0 ? (myTaskStats.completed / myTaskStats.totalTask) * 100 : 0} />

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
                    <span className="text-2xl font-bold">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">建設工事</span>
                    <span className="text-sm text-muted-foreground">
                      {projects.filter(p => p.projectType === 'construction').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">一般プロジェクト</span>
                    <span className="text-sm text-muted-foreground">
                      {projects.filter(p => p.projectType === 'general').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}