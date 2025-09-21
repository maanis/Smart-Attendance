import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

const useSession = (sessionId) => {
    return useQuery({
        queryKey: ["session", sessionId],
        queryFn: async () => {
            if (!sessionId) throw new Error("Session ID is required");

            const response = await axiosInstance.get(`/sessions/${sessionId}`, {
                headers: {
                    Accept: "application/json", // enforce JSON
                },
                validateStatus: () => true, // let us handle HTML / error manually
            });

            // Check if response is JSON
            if (
                response.headers["content-type"]?.includes("application/json") ||
                typeof response.data === "object"
            ) {
                console.log(response.data);
                return response.data?.session || response.data?.error || null;
            } else {
                // fallback: ngrok free HTML error page
                console.warn("Received HTML instead of JSON from ngrok", response.data);
                throw new Error("Invalid response from API (ngrok may be returning HTML)");
            }
        },
        enabled: !!sessionId,
        retry: 1,
        refetchInterval: 30000,
    });
};

export default useSession;
