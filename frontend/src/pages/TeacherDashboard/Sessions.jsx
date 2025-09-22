import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Clock } from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import ActiveSessionsList from "./ActiveSessionsList";

const Sessions = () => {
  const navigate = useNavigate();

  const handleCloseSession = async (sessionId) => {
    try {
      await axiosInstance.put("/sessions/close", { sessionId });
      toast.success("Session Closed", { description: `Session ${sessionId} has been closed.` });
      // Note: ActiveSessionsList will automatically refetch data
    } catch (error) {
      console.error("Close session error:", error);
      toast.error("Failed to Close Session", { description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <div className="md:container md:mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">All Sessions</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <ActiveSessionsList
          onCloseSession={handleCloseSession}
          onViewSession={(id) => navigate(`/teacher/session/${id}`)}
        />
      </main>
    </div>
  );
};

export default Sessions;