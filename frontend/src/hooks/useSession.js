import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:5000/api";

const useSession = (sessionId) => {
    return useQuery({
        queryKey: ["session", sessionId],
        queryFn: async () => {
            if (!sessionId) throw new Error("Session ID is required");

            const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
                method: "GET",
                credentials: "include", // Include cookies for authentication
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch session");
            }

            const data = await response.json();
            return data.session;
        },
        enabled: !!sessionId, // Only run query if sessionId exists
        retry: 1,
        refetchInterval: 30000, // Refetch every 30 seconds to get updated attendance
    });
};

export default useSession;