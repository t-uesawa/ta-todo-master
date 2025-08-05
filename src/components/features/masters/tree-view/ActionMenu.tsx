import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash } from 'lucide-react';
import IconButton from '@mui/material/IconButton';

interface ActionMenuProps {
	onEditOrg: () => void;
	onDeleteOrg: () => void;
}

export default function ActionMenu({ onEditOrg, onDeleteOrg }: ActionMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// 外部クリックでメニューを閉じる
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				buttonRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const handleAction = (action: () => void) => {
		action();
		setIsOpen(false);
	};

	return (
		<div className="relative">
			<IconButton
				ref={buttonRef}
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(!isOpen);
				}}
			>
				<MoreVertical className="h-4 w-4 text-gray-600" />
			</IconButton>

			{isOpen && (
				<div
					ref={menuRef}
					className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50"
				>
					<div className="py-1">
						<button
							onClick={() => handleAction(onEditOrg)}
							className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors whitespace-nowrap"
						>
							<Edit className="mr-2 h-4 w-4" />
							編集
						</button>
						<button
							onClick={() => handleAction(onDeleteOrg)}
							className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap"
						>
							<Trash className="mr-2 h-4 w-4" />
							削除
						</button>
					</div>
				</div>
			)}
		</div>
	);
}