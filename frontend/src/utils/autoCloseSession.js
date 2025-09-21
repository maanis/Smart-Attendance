export const autoCloseSession = async (session, refetch) => {
    if (!session?.createdAt || !session?.isActive) return;

    const createdTime = new Date(session.createdAt);
    const now = new Date();
    const elapsed = Math.floor((now - createdTime) / 1000 / 60); // minutes elapsed

    // Default duration of 60 minutes (can be made configurable)
    const totalDuration = session.duration || 60;
    const remaining = Math.max(0, totalDuration - elapsed);

    // Auto-close session if duration exceeded and session is still active
    if (remaining <= 0 && session.isActive) {
        try {
            // Import axiosInstance here or pass it as parameter
            const axiosInstance = (await import('@/utils/axiosInstance')).default;
            await axiosInstance.put("/sessions/close", { sessionId: session.sessionId });

            // Refetch to update UI
            if (refetch) {
                setTimeout(() => {
                    refetch();
                }, 200);
            }

            console.log(`Session ${session.sessionId} auto-closed due to duration exceeded`);
        } catch (error) {
            console.error("Auto-close session error:", error);
        }
    }

    return remaining;
};