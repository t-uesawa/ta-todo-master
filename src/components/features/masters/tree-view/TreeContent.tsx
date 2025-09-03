/**
 * ツリーで選択したアイテム詳細部分
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/hooks/data/use-project";
import { IconButtonType, MasterDataResult, Task } from "@/types";
import dayjs from "dayjs";
import { ArrowLeft, Calendar, Edit3, FileText, IdCard, ListTodo, Pencil, Plus, TagIcon, Timer, Trash, User } from "lucide-react";

interface TreeContentProps {
	getMasterDataWithType: (uid: string) => MasterDataResult;
	showBackButton: boolean;
	onBackClick?: () => void;
	selectedMaster: string;
	onIconButtonClick: (masterUid: string, type: IconButtonType) => void;
}

export const TreeContent = ({
	getMasterDataWithType,
	showBackButton,
	onBackClick,
	selectedMaster,
	onIconButtonClick
}: TreeContentProps) => {
	const { state } = useAuth();
	const { projects } = useProject();

	const result = getMasterDataWithType(selectedMaster);

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
		return user?.full_name || '不明';
	};

	const renderContent = () => {
		// if (loading) {
		// 	return (
		// 		<div className="grid gap-4 grid-cols-1">
		// 			{[1, 2, 3].map((i) => (
		// 				<MemoCardSkeleton key={i} />
		// 			))}
		// 		</div>
		// 	);
		// }

		if (!result.data || result.type === 'phaseGroup' || result.type === 'phase') {
			return (
				<div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
					<div className="mb-2 rounded-full bg-muted p-3">
						<TagIcon className="h-6 w-6" />
					</div>
					<h3 className="mb-1 text-lg font-medium">未選択</h3>
					<p className="text-sm">タスクマスタを選択してください</p>
				</div>
			);
		}

		return (
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
							{result.data.uid}
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
							{result.data.memo}
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
								{getUserName(result.data.createdBy)}
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
								{result.data.createdAt}
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
								{getUserName(result.data.updatedBy)}
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
								{result.data.updatedAt}
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
					const filteredTasks = pj.tasks.filter(task => task.taskMasterUid === selectedMaster);
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
													{getUserName(filteredTasks[0].assigneeUid)}
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
		)
	}

	return (
		<div className="h-full flex flex-col">
			<div className="h-14 flex items-center justify-between p-1 md:p-6 border-b">
				<div className='flex items-center'>
					{showBackButton && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onBackClick}
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
					)}
					<div>
						<h2 className="text-lg font-semibold">
							{result.type === 'none' ? '未選択' :
								result.type === 'phaseGroup' ? result.data.groupName :
									result.type === 'phase' ? result.data.phaseName :
										result.type === 'taskMaster' ? result.data.taskName : '不明'}
						</h2>
						<p className="text-sm text-muted-foreground">
							{result.type === 'none' ? '' :
								result.type === 'phaseGroup' ? 'フェーズグループ' :
									result.type === 'phase' ? 'フェーズ' :
										result.type === 'taskMaster' ? 'タスク' : '不明'}
						</p>
					</div>
				</div>
				<div className="flex gap-1">
					<Button
						onClick={() => onIconButtonClick(selectedMaster, 'add')}
						disabled={!result.data || result.type === 'taskMaster'}
						variant="ghost"
						size="sm"
					>
						<Plus className="h-4 w-4" />
					</Button>
					<Button
						onClick={() => onIconButtonClick(selectedMaster, 'edit')}
						disabled={!result.data}
						variant="ghost"
						size="sm"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						onClick={() => onIconButtonClick(selectedMaster, 'delete')}
						disabled={!result.data}
						variant="ghost"
						size="sm"
					>
						<Trash className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto">
				{renderContent()}
			</div>
		</div>
	)
}