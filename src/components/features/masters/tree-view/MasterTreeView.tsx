/**
 * マスターのツリー表示
 */
import { useState } from "react";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";
import { TreeView } from "./TreeView";
import { TreeContent } from "./TreeContent";
import { IconButtonType, MasterDataResult, Phase, PhaseGroup, TaskMaster } from "@/types";

interface MasterTreeViewProps {
	getMasterDataWithType: (uid: string) => MasterDataResult;
	onFormOpen: (type: 'phaseGroup' | 'phase' | 'taskMaster', uid: string) => void;
	onEdit: (type: 'phaseGroup' | 'phase' | 'taskMaster', item: PhaseGroup | Phase | TaskMaster) => void;
	onDelete: (type: 'phaseGroup' | 'phase' | 'taskMaster', uid: string, name: string) => void;
}

export function MasterTreeView({ getMasterDataWithType, onFormOpen, onEdit, onDelete }: MasterTreeViewProps) {
	const { isMobile } = useResponsive();

	const [selectedMaster, setSelectedMaster] = useState<string>('');
	// trueで詳細画面、falseでツリーを表示する（モバイル）
	const [showMobileContent, setShowMobileContent] = useState(false);

	// ツリーアイテムをクリックしたときの処理
	const handleMasterSelect = (masterUid: string) => {
		setSelectedMaster(masterUid);
		setShowMobileContent(isMobile && masterUid !== '');
	}

	// ツリーアイテムのアイコンボタンをクリックしたときの処理
	const handleIconButtonClick = (masterUid: string, type: IconButtonType) => {
		if (!masterUid) {
			return onFormOpen('phaseGroup', '');
		}

		// 選択されたアイテムのtypeとdataを取得
		const result = getMasterDataWithType(masterUid);

		if (result.type === 'none') return;

		const name =
			result.type === 'phaseGroup' ? result.data.groupName :
				result.type === 'phase' ? result.data.phaseName :
					result.type === 'taskMaster' ? result.data.taskName : '';

		switch (type) {
			case 'add':
				return onFormOpen(result.type, masterUid);
			case 'edit':
				return onEdit(result.type, result.data);
			case 'detail':
				return handleMasterSelect(masterUid);
			case 'delete':
				return onDelete(result.type, masterUid, name);
		}
	}

	return (
		<div className="flex h-full">
			{/** ツリー */}
			<div
				className={cn(
					"border-r",
					// "h-[calc(100vh-8rem)] md:h-[calc(100vh-7rem)] w-full",
					isMobile ? "z-20 h-full w-full" : "w-2/5 min-w-0",
					isMobile && showMobileContent ? "hidden" : "block"
				)}
			>
				<TreeView
					onSelectedMaster={handleMasterSelect}
					selectedMaster={selectedMaster}
					onIconButtonClick={handleIconButtonClick}
				/>
			</div>
			{/** 詳細 */}
			<div
				className={cn(
					"flex flex-col min-w-0",
					isMobile ? "w-full" : "w-3/5",
					isMobile && !showMobileContent ? "hidden" : "block"
				)}
			>
				<TreeContent
					getMasterDataWithType={getMasterDataWithType}
					showBackButton={isMobile}
					onBackClick={() => handleMasterSelect('')}
					selectedMaster={selectedMaster}
					onIconButtonClick={handleIconButtonClick}
				/>
			</div>
		</div>
	);
}