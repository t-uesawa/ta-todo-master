import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	CheckSquare,
	TrendingUp,
	Users,
	Footprints,
	Timer,
	PieChartIcon
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/hooks/data/use-project';
import dayjs from 'dayjs';
import { Task, TaskFilter } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useMaster } from '@/hooks/data/use-master';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface DashboardProps {
	onPageChange: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps) {
	const { dispatch } = useApp();
	const { projects } = useProject();
	const { taskMasters } = useMaster();
	const { state: authState } = useAuth();

	const getStatusBadge = (status: Task['status']) => {
		switch (status) {
			case 'not_started':
				return <Badge variant="secondary">未着手</Badge>;
			case 'in_progress':
				return <Badge className='bg-blue-600'>進行中</Badge>;
			case 'completed':
				return <Badge className='bg-green-600'>完了</Badge>;
			default:
				return <Badge variant="default">不明</Badge>;
		}
	};

	// const allTaskStats = {
	// };

	// 総タスク数、完了率、進行中、期限切れ
	const myTaskStats = {
		tasks: projects.flatMap(project =>
			project.tasks.filter(task =>
				task.assigneeUid === authState.user?.uid
			)
		),
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
			if (type === 'total') {
				payload.assigneeUid = authState.user?.uid;
			}
		}

		onPageChange('tasks');
		dispatch({
			type: 'SET_TASK_FILTER',
			payload
		});
	};

	const StatusChart: React.FC<{
		completed: number;
		inProgress: number;
		notStarted: number
	}> = ({ completed, inProgress, notStarted }) => {
		const chartConfig = {
			visitors: {
				label: "Visitors",
			},
			notStarted: {
				label: "未着手",
				color: "var(--chart-1)",
			},
			inProgress: {
				label: "進行中",
				color: "var(--chart-2)",
			},
			completed: {
				label: "完了",
				color: "var(--chart-3)",
			},
		};
		const data = [
			{ name: '完了', value: completed, color: '#22c55e' },
			{ name: '進行中', value: inProgress, color: '#3b82f6' },
			{ name: '未着手', value: notStarted, color: '#d1d5db' }
		].filter(item => item.value > 0);

		const total = completed + inProgress + notStarted;

		return (
			<div className="w-full h-40">
				{total > 0 ? (
					<ResponsiveContainer width="100%" height="100%">
						<ChartContainer
							config={chartConfig}
							className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
						>
							<PieChart>
								<ChartTooltip
									content={<ChartTooltipContent nameKey="name" hideLabel />}
								/>
								<Pie
									data={data}
									dataKey="value"
									nameKey="name"
									innerRadius={60}
									strokeWidth={5}
									cx="50%"
									cy="50%"
									outerRadius={80}
									paddingAngle={2}
								>
									<Label
										content={({ viewBox }) => {
											if (viewBox && "cx" in viewBox && "cy" in viewBox) {
												return (
													<text
														x={viewBox.cx}
														y={viewBox.cy}
														textAnchor="middle"
														dominantBaseline="middle"
													>
														<tspan
															x={viewBox.cx}
															y={viewBox.cy}
															className="fill-foreground text-3xl font-bold"
														>
															{total.toLocaleString()}
														</tspan>
														<tspan
															x={viewBox.cx}
															y={(viewBox.cy || 0) + 24}
															className="fill-muted-foreground"
														>
															Tasks
														</tspan>
													</text>
												)
											}
										}}
									/>
									{data.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
					</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">
						<div className="text-center">
							<div className="text-2xl font-bold">0</div>
							<div className="text-sm">タスクがありません</div>
						</div>
					</div>
				)}
			</div>
		);
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
					未実装
				</TabsContent>
				<TabsContent value='person' className='h-full space-y-6'>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className='space-y-4'>
							{/* 統計カード */}
							<div className="grid grid-cols-2 gap-4">
								<Card onClick={() => handleTaskPageTransition('person', 'total')}>
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

								<Card>
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

							{/* Status Chart */}
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										ステータス別状況
									</CardTitle>
									<PieChartIcon className="h-4 w-4" />
								</CardHeader>
								<CardContent className='flex items-center justify-between'>
									<StatusChart
										completed={myTaskStats.completed}
										inProgress={myTaskStats.inProgress}
										notStarted={myTaskStats.notStarted}
									/>
									<div className='w-40'>
										<p><span className='w-2 h-2 mr-2 text-gray-300'>●</span>{`未着手: ${myTaskStats.notStarted}`}</p>
										<p><span className='w-2 h-2 mr-2 text-blue-600'>●</span>{`進行中: ${myTaskStats.inProgress}`}</p>
										<p><span className='w-2 h-2 mr-2 text-green-600'>●</span>{`完了: ${myTaskStats.completed}`}</p>
									</div>
								</CardContent>
							</Card>
						</div>

						<div>
							{/* マイタスク */}
							<Card className="max-h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
								<CardHeader className="sticky top-0 z-8 bg-white">
									<CardTitle className="flex items-center gap-2">
										<Users className="h-5 w-5" />
										マイタスク
									</CardTitle>
									<CardDescription>
										あなたに割り当てられたタスクの状況
									</CardDescription>
								</CardHeader>
								<CardContent className='flex flex-col overflow-y-auto space-y-2 pt-2'>
									{myTaskStats.tasks.length > 0 ?
										myTaskStats.tasks.map(task => (
											<div key={task.uid} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
												<div className="flex items-start justify-between">
													{/** タスク名とプロジェクト名 */}
													<div className="flex-1">
														<h4 className="font-medium text-sm mb-1">{task.taskName || taskMasters.find(tm => tm.uid === task.taskMasterUid)?.taskName || '不明'}</h4>
														<span className="flex items-center gap-2 text-xs text-gray-500">
															{projects.find(p => p.uid === task.projectUid)?.projectName || ''}
														</span>
													</div>
													{/** ステータスと期限 */}
													<div className='flex flex-col items-end gap-2'>
														{getStatusBadge(task.status)}
														<div className="flex items-center gap-2 text-xs text-gray-500">
															<Timer className="w-3 h-3" />
															{task.dueDate}
														</div>
													</div>
												</div>
											</div>
										)) : (
											<p className='text-center'>割り当てられたタスクはありません。</p>
										)}
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>
			</div>
		</Tabs>
	);
}