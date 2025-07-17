/**
 * グループかフェーズを選択するダイアログ
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type EntryType = 'phaseGroup' | 'phase';

type Props = {
	open: boolean;
	onClose: () => void;
	onSelect: (type: EntryType) => void;
}

export function SelectAddTypeDialog({ open, onClose, onSelect }: Props) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>追加するタイプを選択</DialogTitle>
					<DialogDescription>「グループ」か「フェーズ」を選択</DialogDescription>
				</DialogHeader>
				<div className="flex justify-center gap-4 mt-4">
					<Button onClick={() => onSelect('phaseGroup')}>グループを追加</Button>
					<Button onClick={() => onSelect('phase')}>フェーズを追加</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}