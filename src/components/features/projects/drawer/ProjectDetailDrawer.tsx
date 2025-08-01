/**
 * プロジェクトの詳細ドロワー
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useMaster } from "@/hooks/data/use-master";
import { Project, Task } from "@/types";
import dayjs from "dayjs";
import { Calendar, Edit3, FileText, HardHat, ListTodo, Timer, User, X } from "lucide-react";

interface ProjectDetailDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	selectedProject: Project;
}

export const ProjectDetailDrawer = ({ isOpen, onClose, selectedProject }: ProjectDetailDrawerProps) => {
	const { state } = useAuth();
	const { constructions, taskMasters } = useMaster();

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

	const getUserName = (userUid: string) => {
		const user = state.users.find(u => u.uid === userUid);
		return user?.name || '不明';
	};


	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
				<SheetHeader>
					<SheetTitle>
						{selectedProject.projectName}
					</SheetTitle>
					<SheetDescription>
						{selectedProject.projectType === 'construction' ? '工事プロジェクト' : '一般プロジェクト'}
					</SheetDescription>
				</SheetHeader>

				<Separator className="my-6" />

				{/* コンテンツ */}
				<div className="flex-1 min-h-0">
					<div className="space-y-6">
						{/** 工事情報 */}
						{selectedProject.kojiUid && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<HardHat className="h-5 w-5" />
										工事情報
									</CardTitle>
								</CardHeader>
								<CardContent>
									{(() => {
										const koji = constructions.find(c => c.id === selectedProject.kojiUid);
										return koji ? (
											<div className="space-y-2 text-sm">
												<div className='w-full flex'>
													<p className='w-1/5'>工事名:</p>
													<p className='w-4/5'>{koji.label}</p>
												</div>
												<div className='w-full flex'>
													<p className='w-1/5'>発注者:</p>
													<p className='w-4/5'>{koji.client}</p>
												</div>
												<div className='w-full flex'>
													<p className='w-1/5'>工期:</p>
													<p className='w-4/5'>{dayjs(koji.start).format('YYYY/MM/DD')} ～ {dayjs(koji.end).format('YYYY/MM/DD')}</p>
												</div>
												<div className='w-full flex'>
													<p className='w-1/5'>金額:</p>
													<p className='w-4/5'>{koji.contractAmount ? `${parseInt(koji.contractAmount).toLocaleString()}円` : '不明'}</p>
												</div>
											</div>
										) : null;
									})()}
								</CardContent>
							</Card>
						)}

						{/** タスク情報 */}
						<div className="flex items-center gap-2">
							<ListTodo className="h-5 w-5" />
							<h3 className="text-lg font-semibold">タスク一覧</h3>
						</div>
						<Separator className="my-6" />

						{selectedProject.tasks.map(task => {
							const taskName = task.taskName || (taskMasters.find(tm => tm.uid === task.taskMasterUid)?.taskName ?? '不明');
							const taskDescription = taskMasters.find(tm => tm.uid === task.taskMasterUid)?.taskDescription;

							return (
								<Card key={task.uid}>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div>
												<CardTitle>{taskName}</CardTitle>
												<CardDescription>
													{taskDescription || '一般プロジェクト'}
												</CardDescription>
											</div>
											{getProjectStatusBadge(task.status)}
										</div>
									</CardHeader>
									<CardContent>
										<div className="space-y-2 text-sm">
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
														{task.assigneeUid}
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
														{dayjs(task.dueDate).format('YYYY-MM-DD')}
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
														{task.memo || 'なし'}
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
															{getUserName(task.createdBy)}
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
															{task.createdAt}
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
															{getUserName(task.updatedAt)}
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
															{task.updatedAt}
														</p>
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				</div>

				<Separator className="my-6" />

				<SheetFooter>
					<Button
						variant="outline"
						onClick={onClose}
						className="flex items-center gap-2"
					>
						<>
							<X className="h-4 w-4" />
							閉じる
						</>
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}