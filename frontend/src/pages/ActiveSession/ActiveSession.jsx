// src/pages/ActiveSession.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

import useSession from "@/hooks/useSession";
import axiosInstance from "@/utils/axiosInstance";
import { autoCloseSession } from "@/utils/autoCloseSession";

import { Button } from "@/components/ui/button";
// import SessionHeader from "@/components/session/SessionHeader";
import SessionInfoCard from "./SessionInfoCard";
import SessionStatCards from "./SessionStatCards";
import RecentAttendeesList from "./RecentAttendeesList";
import SessionControls from "./SessionControls";
import SessionHeader from "./SessionHeader";

const ActiveSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { data: session, isLoading, error, refetch } = useSession(sessionId);

  // State for time left, calculated from autoCloseSession utility
  const [minutesLeft, setMinutesLeft] = useState(session?.duration || 0);

  // Timer logic for countdown and auto-closing
  useEffect(() => {
    if (!session?.createdAt || !session?.isActive) {
      if (session) setMinutesLeft(0);
      return;
    }

    const checkSession = async () => {
      const remaining = await autoCloseSession(session, refetch);
      setMinutesLeft(remaining);
      if (remaining <= 5 && remaining > 0 && session.isActive) {
        console.warn(`⚠️ Session expires in ${remaining} minutes!`);
      }
    };

    checkSession(); // Initial check

    // Set up an interval that becomes more frequent as the session nears its end
    const intervalTime = minutesLeft > 0 && minutesLeft <= 10 ? 5000 : 30000;
    const interval = setInterval(checkSession, intervalTime);

    return () => clearInterval(interval);
  }, [session, refetch, minutesLeft]);

  const handleManualClose = async () => {
    if (!session) return;
    try {
      await axiosInstance.put("/sessions/close", { sessionId: session.sessionId });
      toast.success("Session Closed Manually", {
        description: "The attendance list is now finalized.",
      });
      refetch(); // Refetch to update the session state to inactive
    } catch (err) {
      console.error("Close session error:", err);
      toast.error("Failed to Close Session", { description: err.message });
    }
  };

  // --- RENDER STATES ---
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Session Details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg border bg-card p-8 text-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">
            {error ? "Error Loading Session" : "Session Not Found"}
          </h2>
          <p className="text-muted-foreground">
            {error ? error.message : "The session you are looking for does not exist."}
          </p>
          <Button asChild>
            <Link to="/teacher"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <SessionHeader session={session} />

      <main className="container mx-auto p-4 md:p-8">
        {/* IMPROVEMENT: A more dynamic, responsive two-column grid layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">

          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            <SessionInfoCard session={session} />
            <SessionStatCards session={session} minutesLeft={minutesLeft} />
            <SessionControls
              session={session}
              onClose={handleManualClose}
              onViewAttendance={() => navigate(`/teacher/attendance/${session.sessionId}`)}
            />
          </div>

          {/* Sidebar column for recent attendees */}
          <div className="lg:col-span-1">
            <RecentAttendeesList attendees={session.attendance} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default ActiveSession;