import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useResponsive } from '@/hooks/useResponsive';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { Project, Task } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { Calendar } from '@/components/ui/calendar';
import { useProject } from '@/hooks/data/use-project';

interface TaskEditDialogProps {
	isOpen: boolean;
	onClose: () => void;
	editingTask: Task;
}

export function TaskEditDialog({ isOpen, onClose, editingTask }: TaskEditDialogProps) {
	const { state: authState } = useAuth();
	const { projects, loading, updateTask } = useProject();
	const { isMobile } = useResponsive();

	const [taskName, setTaskName] = useState(editingTask.taskName || '');
	const [assigneeUid, setAssigneeUid] = useState(editingTask.assigneeUid || '');
	const [dueDate, setDueDate] = useState(editingTask.dueDate || '');
	const [status, setStatus] = useState<Task['status']>(editingTask.status);
	const [memo, setMemo] = useState<string>('');

	const [calendarOpen, setCalendarOpen] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (editingTask.taskName && !taskName.trim()) throw new Error('タスク名が入力されていません');
			if (!assigneeUid) throw new Error('担当者が選択されていません');
			if (!dueDate) throw new Error('期日が選択されていません');

			const newTask: Task = {
				...editingTask,
				taskName: taskName.trim(),
				assigneeUid,
				dueDate,
				status,
				memo,
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: authState.user?.uid || '',
			};
			const project = projects.find(pj => pj.uid === newTask.projectUid);

			if (!project) {
				throw new Error('プロジェクトが見つかりませんでした。');
			}

			const updatedProject: Project = {
				...project,
				tasks: project.tasks.map(t => t.uid === newTask.uid ? newTask : t)
			};

			await updateTask(updatedProject, newTask);

			toast.success('成功!', {
				description: 'ステータスの更新が完了しました'
			});

			handleClose();
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'の更新に失敗しました';
			toast.error('失敗!', {
				description: errMsg,
			});
			return;
		}
	};

	const handleClose = () => {
		setTaskName(editingTask.taskName);
		setAssigneeUid(editingTask.assigneeUid);
		setDueDate(editingTask.dueDate);
		setStatus(editingTask.status)
		setMemo(editingTask.memo);
		onClose();
	};

	useEffect(() => {
		setTaskName(editingTask.taskName);
		setAssigneeUid(editingTask.assigneeUid);
		setDueDate(editingTask.dueDate);
		setMemo(editingTask.memo);
	}, [editingTask]);

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
						タスク編集
					</DialogTitle>
					<DialogDescription>
						※ その他の編集はプロジェクト編集で行ってください。
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						{editingTask.taskName && (
							/** 一般タスク */
							<div className="space-y-2">
								<Label htmlFor="taskName">タスク名</Label>
								<Input
									id="taskName"
									value={taskName}
									onChange={(e) => setTaskName(e.target.value)}
									placeholder="タスク名を入力..."
									required
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label>担当者</Label>
							<Select
								value={assigneeUid || ''}
								onValueChange={(value) => setAssigneeUid(value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="担当者を選択..." />
								</SelectTrigger>
								<SelectContent>
									{authState.users.map(user => (
										<SelectItem key={user.uid} value={user.uid}>
											<span className="font-medium">{user.name}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>期日</Label>
							<Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
								<DialogTrigger asChild>
									<Button variant="outline" className="w-full justify-start text-left font-normal">
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dueDate
											? dayjs(dueDate).format('YYYY/MM/DD')
											: '期日を選択...'}
									</Button>
								</DialogTrigger>
								<DialogContent className="w-auto p-6">
									<DialogTitle>期日設定</DialogTitle>
									<DialogDescription>{`期日を設定`}</DialogDescription>
									<Calendar
										mode="single"
										captionLayout="dropdown"
										selected={dayjs(dueDate).toDate() ?? undefined}
										onSelect={(date) => {
											if (date) {
												setDueDate(dayjs(date).format('YYYY-MM-DD'));
												setCalendarOpen(false);
											}
										}}
										initialFocus
										disabled={(date) => date < new Date()} // 過去の日付は無効化
									/>
								</DialogContent>
							</Dialog>
						</div>

						<div className="space-y-2">
							<Label>ステータス</Label>
							<Select
								value={status}
								onValueChange={(value: 'not_started' | 'in_progress' | 'completed') =>
									setStatus(value)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="not_started">未着手</SelectItem>
									<SelectItem value="in_progress">進行中</SelectItem>
									<SelectItem value="completed">完了</SelectItem>
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
						<Button type="submit">
							{editingTask ? '更新' : '作成'}
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
						タスク編集
					</DrawerTitle>
					<DrawerDescription>
						※ その他の編集はプロジェクト編集で行ってください。
					</DrawerDescription>
				</DrawerHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						{editingTask.taskName && (
							/** 一般タスク */
							<div className="space-y-2">
								<Label htmlFor="taskName">タスク名</Label>
								<Input
									id="taskName"
									value={taskName}
									onChange={(e) => setTaskName(e.target.value)}
									placeholder="タスク名を入力..."
									required
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label>担当者</Label>
							<Select
								value={assigneeUid || ''}
								onValueChange={(value) => setAssigneeUid(value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="担当者を選択..." />
								</SelectTrigger>
								<SelectContent>
									{authState.users.map(user => (
										<SelectItem key={user.uid} value={user.uid}>
											<span className="font-medium">{user.name}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>期日</Label>
							<Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
								<DialogTrigger asChild>
									<Button variant="outline" className="w-full justify-start text-left font-normal">
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dueDate
											? dayjs(dueDate).format('YYYY/MM/DD')
											: '期日を選択...'}
									</Button>
								</DialogTrigger>
								<DialogContent className="w-auto p-6">
									<DialogTitle>期日設定</DialogTitle>
									<DialogDescription>{`期日を設定`}</DialogDescription>
									<Calendar
										mode="single"
										captionLayout="dropdown"
										selected={dayjs(dueDate).toDate() ?? undefined}
										onSelect={(date) => {
											if (date) {
												setDueDate(dayjs(date).format('YYYY-MM-DD'));
												setCalendarOpen(false);
											}
										}}
										initialFocus
										disabled={(date) => date < new Date()} // 過去の日付は無効化
									/>
								</DialogContent>
							</Dialog>
						</div>

						<div className="space-y-2">
							<Label>ステータス</Label>
							<Select
								value={status}
								onValueChange={(value: 'not_started' | 'in_progress' | 'completed') =>
									setStatus(value)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="not_started">未着手</SelectItem>
									<SelectItem value="in_progress">進行中</SelectItem>
									<SelectItem value="completed">完了</SelectItem>
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
						<Button type="submit">
							{editingTask ? '更新' : '作成'}
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