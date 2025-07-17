/**
 * マスターのカード表示
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Plus,
	Edit,
	Trash2,
	FolderTree,
	FileText,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Phase, PhaseGroup, TaskMaster } from '@/types';

interface MasterCardViewProps {
	onFormOpen: (type: 'phaseGroup' | 'phase' | 'taskMaster', showType: 'add' | 'edit') => void;
	onEdit: (type: 'phaseGroup' | 'phase' | 'taskMaster', item: PhaseGroup | Phase | TaskMaster) => void;
	onDelete: (type: 'phaseGroup' | 'phase' | 'taskMaster', uid: string, name: string) => void;
}

export function MasterCardView({ onFormOpen, onEdit, onDelete }: MasterCardViewProps) {
	const { state: appState } = useApp();
	const { state: authState } = useAuth();

	const [activeTab, setActiveTab] = useState('phaseGroups');

	const getPhaseCount = (groupUid: string) => {
		return appState.phases.filter(p => p.parentGroupUid === groupUid).length;
	};

	const getTaskCount = (phaseUid: string) => {
		return appState.taskMasters.filter(tm => tm.phaseUid === phaseUid).length;
	};

	const getCreatorName = (createdBy: string) => {
		const user = authState.users.find(u => u.uid === createdBy);
		return user?.name || '不明';
	};

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
			<TabsList className="grid w-full grid-cols-3">
				<TabsTrigger value="phaseGroups">フェーズグループ</TabsTrigger>
				<TabsTrigger value="phases">フェーズ</TabsTrigger>
				<TabsTrigger value="tasks">タスクマスタ</TabsTrigger>
			</TabsList>

			<TabsContent value="phaseGroups" className="flex-1 space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">フェーズグループ一覧</h3>
					<Button onClick={() => onFormOpen('phaseGroup', 'add')}>
						<Plus className="h-4 w-4 mr-2" />
						新規追加
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{appState.phaseGroups.map(group => (
						<Card key={group.uid} className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-4">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2">
										<FolderTree className="h-5 w-5 text-blue-600" />
										<CardTitle className="text-lg">{group.groupName}</CardTitle>
									</div>
									<div className="flex gap-1">
										<Button variant="ghost" size="sm" onClick={() => onEdit('phaseGroup', group)}>
											<Edit className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="sm" onClick={() => onDelete('phaseGroup', group.uid, group.groupName)}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600">フェーズ数</span>
									<Badge variant="secondary">{getPhaseCount(group.uid)}</Badge>
								</div>
								<div className="text-sm text-gray-500">
									作成者: {getCreatorName(group.createdBy)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</TabsContent>

			<TabsContent value="phases" className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">フェーズ一覧</h3>
					<Button onClick={() => onFormOpen('phase', 'add')}>
						<Plus className="h-4 w-4 mr-2" />
						新規追加
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{appState.phases.map(phase => {
						const parentGroup = appState.phaseGroups.find(pg => pg.uid === phase.parentGroupUid);
						return (
							<Card key={phase.uid} className="hover:shadow-md transition-shadow">
								<CardHeader className="pb-4">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<CardTitle className="text-lg">{phase.phaseName}</CardTitle>
											<Badge variant="outline">{parentGroup?.groupName}</Badge>
										</div>
										<div className="flex gap-1">
											<Button variant="ghost" size="sm" onClick={() => onEdit('phase', phase)}>
												<Edit className="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="sm" onClick={() => onDelete('phase', phase.uid, phase.phaseName)}>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-600">タスク数</span>
										<Badge variant="secondary">{getTaskCount(phase.uid)}</Badge>
									</div>
									<div className="text-sm text-gray-500">
										作成者: {getCreatorName(phase.createdBy)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</TabsContent>

			{/** タスクマスタ */}
			<TabsContent value="tasks" className="flex-1 space-y-4">
				<div className="flex flex-col h-screen">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">タスクマスタ一覧</h3>
						<Button onClick={() => onFormOpen('taskMaster', 'add')}>
							<Plus className="h-4 w-4 mr-2" />
							新規追加
						</Button>
					</div>

					<div className="relative flex grow">
						<div className="absolute w-full h-full overflow-y-scroll">
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{appState.taskMasters.map(taskMaster => {
									const phase = appState.phases.find(p => p.uid === taskMaster.phaseUid);
									const phaseGroup = phase ? appState.phaseGroups.find(pg => pg.uid === phase.parentGroupUid) : null;

									return (
										<Card key={taskMaster.uid} className="hover:shadow-md transition-shadow">
											<CardHeader className="pb-4">
												<div className="flex items-start justify-between">
													<div className="space-y-2">
														<div className="flex items-center gap-2">
															<FileText className="h-5 w-5 text-green-600" />
															<CardTitle className="text-lg">{taskMaster.taskName}</CardTitle>
														</div>
														<div className="flex gap-2">
															<Badge variant="outline">{phaseGroup?.groupName}</Badge>
															<Badge variant="secondary">{phase?.phaseName}</Badge>
														</div>
													</div>
													<div className="flex gap-1">
														<Button variant="ghost" size="sm" onClick={() => onEdit('taskMaster', taskMaster)}>
															<Edit className="h-4 w-4" />
														</Button>
														<Button variant="ghost" size="sm" onClick={() => onDelete('taskMaster', taskMaster.uid, taskMaster.taskName)}>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</CardHeader>
											<CardContent className="space-y-2">
												{taskMaster.taskDescription && (
													<p className="text-sm text-gray-600">{taskMaster.taskDescription}</p>
												)}
												<div className="text-sm text-gray-500">
													作成者: {getCreatorName(taskMaster.createdBy)}
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>
					</div >
				</div>
			</TabsContent>
		</Tabs>
	);
}