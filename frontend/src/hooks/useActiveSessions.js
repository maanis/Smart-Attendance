import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:5000/api";

const useActiveSessions = () => {
    return useQuery({
        queryKey: ["active-sessions"],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/sessions/active`, {
                method: "GET",
                credentials: "include", // Include cookies for authentication
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch active sessions");
            }

            const data = await response.json();
            return data.sessions;
        },
        retry: 1,
        refetchInterval: 30000, // Refetch every 30 seconds to get updated attendance counts
    });
};

export default useActiveSessions;