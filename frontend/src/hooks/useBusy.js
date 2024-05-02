import { useState } from "react";
import toast from "react-hot-toast";

const useBusy = () => {
	const [loading, setLoading] = useState(false);

	const busy = async (state) => {
		setLoading(true);
        try {
            let newstate = state.toString().toLowerCase()
            console.log("/api/users/status/"+newstate)
			const res = await fetch("/api/users/status/"+newstate, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
			});
            const data = await res.json();
            toast.success("Status set to " + newstate.toUpperCase() + " successfully!");
			if (data.error) {
				throw new Error(data.error);
			}
        } catch (error) {
            console.log("ERROR", error.message)
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, busy };
};
export default useBusy;
