
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";


const useActiveSessions = () => {
    return useQuery({
        queryKey: ["active-sessions"],
        queryFn: async () => {
            const response = await axiosInstance.get("/sessions/active");
            return response.data.sessions;
        },
        retry: 1,
        refetchInterval: 30000,
    });
};

export default useActiveSessions;