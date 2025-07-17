import { TreeView } from "../masters/tree-view/TreeView"

export const Test = () => {
	return (
		<div className='h-full flex flex-col'>
			<div className='h-64 bg-black flex-shrink-0'></div>
			<div className='flex-1 overflow-hidden'>
				<TreeView onSelectedMaster={() => []} selectedMaster='' onIconButtonClick={() => { }} />
			</div>
		</div>
	)
}