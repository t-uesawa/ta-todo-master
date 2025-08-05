import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { useProject } from '@/hooks/data/use-project';
import { useResponsive } from '@/hooks/useResponsive';
import { Task, TaskMaster } from '@/types';
import dayjs from 'dayjs';
import { Calendar, Edit3, FileText, IdCard, ListTodo, Timer, User } from 'lucide-react';

interface TaskMasterDetailDialogProps {
	open: boolean;
	onClose: () => void;
	target: TaskMaster;
	getUserName: (userUid: string) => string
};

export const TaskMasterDetailDialog = ({ open, onClose, target, getUserName }: TaskMasterDetailDialogProps) => {
	const { projects } = useProject();
	const { isMobile } = useResponsive();

	const getProjectStatusBadge = (status: Task['status']) => {
		switch (status) {
			case 'not_started':
				return <Badge variant="default">未着手</Badge>;
			case 'in_progress':
				return <Badge variant="secondary">進行中</Badge>;
			case 'completed':
				return <Badge variant="destructive">完了</Badge>;
			default:
				return <Badge variant="outline">不明</Badge>;
		}
	};

	return !isMobile ? (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-h-[80vh] flex flex-col'>
				<DialogHeader>
					<DialogTitle>{target.taskName}</DialogTitle>
					<DialogDescription>
						{target.taskDescription}
					</DialogDescription>
				</DialogHeader>

				<div className='flex-1 overflow-y-auto'>
					<div className="space-y-2 text-sm p-4">
						<div className="flex items-center gap-2">
							<ListTodo className="h-5 w-5" />
							<h3 className="text-lg font-semibold">基本情報</h3>
						</div>

						<Separator className="my-6" />

						{/** uid */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<IdCard className="h-4 w-4 text-muted-foreground" />
								<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									ID
								</label>
							</div>
							<div className="rounded-md border bg-muted/50 px-3 py-2">
								<p className="text-sm">
									{target.uid}
								</p>
							</div>
						</div>

						{/* メモ */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									メモ
								</label>
							</div>
							<div className="rounded-md border bg-muted/50 px-3 py-2">
								<p className="text-sm leading-relaxed">
									{target.memo}
								</p>
							</div>
						</div>

						{/* 作成 */}
						<div className="grid gap-2 md:grid-cols-2">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										作成者
									</label>
								</div>
								<div className="rounded-md border bg-muted/50 px-3 py-2">
									<p className="text-sm">
										{getUserName(target.createdBy)}
									</p>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										作成日時
									</label>
								</div>
								<div className="rounded-md border bg-muted/50 px-3 py-2">
									<p className="text-sm font-mono">
										{target.createdAt}
									</p>
								</div>
							</div>
						</div>

						{/* 更新 */}
						<div className="grid gap-2 md:grid-cols-2">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Edit3 className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										更新者
									</label>
								</div>
								<div className="rounded-md border bg-muted/50 px-3 py-2">
									<p className="text-sm">
										{getUserName(target.updatedBy)}
									</p>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										更新日時
									</label>
								</div>
								<div className="rounded-md border bg-muted/50 px-3 py-2">
									<p className="text-sm font-mono">
										{target.updatedAt}
									</p>
								</div>
							</div>
						</div>

						{/** 使用プロジェクト */}
						<div className="flex items-center gap-2">
							<ListTodo className="h-5 w-5" />
							<h3 className="text-lg font-semibold">使用プロジェクト</h3>
						</div>

						<Separator className="my-6" />

						{projects.map(pj => {
							const filteredTasks = pj.tasks.filter(task => task.taskMasterUid === target.uid);
							if (filteredTasks.length) {
								return (
									<Card key={pj.uid}>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div>
													<CardTitle>{pj.projectName}</CardTitle>
													<CardDescription>
														{pj.projectType === 'construction' ? '工事プロジェクト' : '一般プロジェクト'}
													</CardDescription>
												</div>
												{getProjectStatusBadge(filteredTasks[0].status)}
											</div>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-2 gap-2 text-sm">
												{/** 担当者 */}
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<User className="h-4 w-4 text-muted-foreground" />
														<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
															担当者
														</label>
													</div>
													<div className="rounded-md border bg-muted/50 px-3 py-2">
														<p className="text-sm">
															{filteredTasks[0].assigneeUid}
														</p>
													</div>
												</div>

												{/** 期限 */}
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Timer className="h-4 w-4 text-muted-foreground" />
														<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
															期限
														</label>
													</div>
													<div className="rounded-md border bg-muted/50 px-3 py-2">
														<p className="text-sm font-mono">
															{dayjs(filteredTasks[0].dueDate).format('YYYY-MM-DD')}
														</p>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								)
							}
						})}
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button">
							閉じる
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	) : (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent className='max-h-[95vh] flex flex-col'>
				<DrawerHeader>
					<DrawerTitle>{target.taskName}</DrawerTitle>
					<DrawerDescription>
						{target.taskDescription}
					</DrawerDescription>
				</DrawerHeader>

				<div className='flex-1 overflow-y-auto'>
					<div className="space-y-2 text-sm p-4">
						<div className="flex items-center gap-2">
							<ListTodo className="h-5 w-5" />
							<h3 className="text-lg font-semibold">基本情報</h3>
						</div>

						<Separator className="my-6" />

						{/** uid */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<IdCard className="h-4 w-4 text-muted-foreground" />
								<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									ID
								</label>
							</div>
							<div className="rounded-md border bg-muted/50 px-3 py-2">
								<p className="text-sm">
									{target.uid}
								</p>
							</div>
						</div>

						{/* メモ */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									メモ
								</label>
							</div>
							<div className="rounded-md border bg-muted/50 px-3 py-2">
								<p className="text-sm leading-relaxed">
									{target.memo}
								</p>
							</div>
						</div>

						{/* 作成 */}
						<div className="grid gap-2 md:grid-cols-2">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										作成者
									</label>
								</div>
								<div className="rounded-md border bg-muted/50 px-3 py-2">
									<p className="text-sm">
										{getUserName(target.createdBy)}
									</p>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										作成日時
									</label>
								</div>
								<div className="rounded-md border bg-muted/50 px-3 py-2">
									<p className="text-sm font-mono">
										{target.createdAt}
									</p>
								</div>
							</div>
						</div>

						{/* 更新 */}
						<div className="grid gap-2 md:grid-cols-2">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Edit3 className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										更新者
									</label>
								</div>
								<div className="rounded-md border bg-muted/50 px-3 py-2">
									<p className="text-sm">
										{getUserName(target.updatedBy)}
									</p>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										更新日時
									</label>
								</div>
								<div className="rounded-md border bg-muted/50 px-3 py-2">
									<p className="text-sm font-mono">
										{target.updatedAt}
									</p>
								</div>
							</div>
						</div>

						{/** 使用プロジェクト */}
						<div className="flex items-center gap-2">
							<ListTodo className="h-5 w-5" />
							<h3 className="text-lg font-semibold">使用プロジェクト</h3>
						</div>

						<Separator className="my-6" />

						{projects.map(pj => {
							const filteredTasks = pj.tasks.filter(task => task.taskMasterUid === target.uid);
							if (filteredTasks.length) {
								return (
									<Card key={pj.uid}>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div>
													<CardTitle>{pj.projectName}</CardTitle>
													<CardDescription>
														{pj.projectType === 'construction' ? '工事プロジェクト' : '一般プロジェクト'}
													</CardDescription>
												</div>
												{getProjectStatusBadge(filteredTasks[0].status)}
											</div>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-2 gap-2 text-sm">
												{/** 担当者 */}
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<User className="h-4 w-4 text-muted-foreground" />
														<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
															担当者
														</label>
													</div>
													<div className="rounded-md border bg-muted/50 px-3 py-2">
														<p className="text-sm">
															{filteredTasks[0].assigneeUid}
														</p>
													</div>
												</div>

												{/** 期限 */}
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Timer className="h-4 w-4 text-muted-foreground" />
														<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
															期限
														</label>
													</div>
													<div className="rounded-md border bg-muted/50 px-3 py-2">
														<p className="text-sm font-mono">
															{dayjs(filteredTasks[0].dueDate).format('YYYY-MM-DD')}
														</p>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								)
							}
						})}
					</div>
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button type="button">
							閉じる
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}