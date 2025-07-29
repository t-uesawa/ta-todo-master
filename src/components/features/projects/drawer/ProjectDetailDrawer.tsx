/**
 * プロジェクトの詳細ドロワー
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useApp } from "@/contexts/AppContext";
import { Project } from "@/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import dayjs from "dayjs";
import { Building, X } from "lucide-react";

interface ProjectDetailDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	selectedProject: Project;
}

export const ProjectDetailDrawer = ({ isOpen, onClose, selectedProject }: ProjectDetailDrawerProps) => {
	const { state: appState } = useApp();

	const kouji = appState.constructions.find(c => c.id === selectedProject.kojiUid);

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
				<SheetHeader>
					<SheetTitle>
						{selectedProject.projectName}
					</SheetTitle>
					<SheetDescription>
						{selectedProject.projectType === 'construction' ? '工事' : '一般'}
					</SheetDescription>
				</SheetHeader>

				<Separator className="my-6" />

				{/* コンテンツ */}
				<div className="flex-1 min-h-0">
					<div className="space-y-6">
						{/** プロジェクト基本情報 */}
						<div className="space-y-2">
							<div><strong>選択工事:</strong> {kouji ? `${kouji.code} | ${kouji.code}` : 'none'}</div>
							<div><strong>作成者:</strong> {selectedProject.createdBy}</div>
							<div><strong>作成日時:</strong> {format(selectedProject.createdAt, 'yyyy/MM/dd', { locale: ja })}</div>
						</ div>

						{/** 工事情報 */}
						{selectedProject.kojiUid && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Building className="h-5 w-5" />
										工事情報
									</CardTitle>
								</CardHeader>
								<CardContent>
									{(() => {
										const koji = appState.constructions.find(c => c.id === selectedProject.kojiUid);
										return koji ? (
											<div className="space-y-2 text-sm">
												<div><strong>工事名:</strong> {koji.label}</div>
												<div><strong>発注者:</strong> {koji.client}</div>
												<div><strong>工期:</strong> {dayjs(koji.start).format('YYYY/MM/DD')} ～ {dayjs(koji.end).format('YYYY/MM/DD')}</div>
												<div><strong>契約金額:</strong> {koji.contractAmount ? `${parseInt(koji.contractAmount).toLocaleString()}円` : '不明'}</div>
											</div>
										) : null;
									})()}
								</CardContent>
							</Card>
						)}

						{/** タスク情報 */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Building className="h-5 w-5" />
									タスク
								</CardTitle>
							</CardHeader>
							<CardContent>
								{(() => {
									const koji = appState.constructions.find(c => c.id === selectedProject.kojiUid);
									return koji ? (
										<div className="space-y-2 text-sm">
											<div><strong>工事名:</strong> {koji.label}</div>
											<div><strong>発注者:</strong> {koji.client}</div>
											<div><strong>工期:</strong> {dayjs(koji.start).format('YYYY/MM/DD')} ～ {dayjs(koji.end).format('YYYY/MM/DD')}</div>
											<div><strong>契約金額:</strong> {koji.contractAmount ? `${parseInt(koji.contractAmount).toLocaleString()}円` : '不明'}</div>
										</div>
									) : null;
								})()}
							</CardContent>
						</Card>
					</div>
				</div>

				<Separator className="my-6" />

				{/* フッター */}
				<div className="flex items-center justify-between">
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
				</div>
			</SheetContent>
		</Sheet>
	)
}