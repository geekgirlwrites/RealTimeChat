import { useState } from 'react';
import { BiNoEntry, BiSolidUserCheck } from "react-icons/bi";
import useBusy from "../../hooks/useBusy";

const BusyButton = () => {
    const { loading, busy } = useBusy();
    const [icon, setIcon] = useState(false); // State to toggle between icons
    const [state, setState] = useState("AVAILABLE"); // State to toggle between icons
    
    const handleClick = () => {
        setIcon(prevIcon => !prevIcon); // Toggle the icon
        state === "AVAILABLE" ? setState("BUSY") : setState("AVAILABLE");
        busy(state); // Call the busy function
    };

    return (
        <div className='mt-auto'>
            {!loading ? (
                <div onClick={handleClick}>
                    {icon ? <BiNoEntry className='w-6 h-6 text-white cursor-pointer' /> : <BiSolidUserCheck className='w-6 h-6 text-white cursor-pointer' />}
                </div>
            ) : (
                <span className='loading loading-spinner'></span>
            )}
        </div>
    );
};

export default BusyButton;
