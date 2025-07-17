/**
 * ツリーで選択したアイテム詳細部分
 */

import { Button } from "@/components/ui/button";
import { IconButtonType, MasterDataResult } from "@/types";
import { ArrowLeft, Pencil, Plus, TagIcon, Trash } from "lucide-react";

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
	const result = getMasterDataWithType(selectedMaster);

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

		if (!result.data) {
			return (
				<div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
					<div className="mb-2 rounded-full bg-muted p-3">
						<TagIcon className="h-6 w-6" />
					</div>
					<h3 className="mb-1 text-lg font-medium">未選択</h3>
					<p className="text-sm">マスタを選択してください</p>
				</div>
			);
		}
	}

	return (
		<div className="flex flex-col">
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

			{renderContent()}
		</div>
	)
}