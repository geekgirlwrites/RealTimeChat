import BusyButton from "./BusyButton";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";

const Sidebar = () => {
	return (
		<div className='border-r border-slate-500 p-4 flex flex-col'>
			<SearchInput />
			<div className='divider px-3'></div>
			<Conversations />
			<div className='mt-auto flex justify-between items-center'>
                <div className="flex horizontal justify-between ">
                    <LogoutButton />
                </div>
                <div className='ml-2'>
                    <BusyButton />
                </div>
            </div>
		</div>
	);
};
export default Sidebar;

