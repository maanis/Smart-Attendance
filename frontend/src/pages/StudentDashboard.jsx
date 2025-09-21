import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, LogIn, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion"; // --- UI/UX Improvement: For smooth animations

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  // Check for token and redirect to teacher dashboard if one exists (logic is solid, no changes)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/teacher/dashboard');
    }
  }, [navigate]);

  const handleJoinSession = () => {
    if (roomId.trim().length < 6) { // A bit more specific validation
      toast.error("Invalid Room ID", {
        description: "Please enter the complete Room ID provided by your teacher.",
      });
      return;
    }
    navigate(`/student/attendance/${roomId.trim().toUpperCase()}`);
  };

  // --- UI/UX Improvement: Allow joining by pressing 'Enter' key
  const handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      handleJoinSession();
    }
  };

  return (
    // --- UI/UX Improvement: A more engaging background and layout
    <div className="relative flex flex-col min-h-screen w-full items-center justify-center bg-background p-4 overflow-hidden">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* --- UI/UX Improvement: Cleaner, more integrated header */}
      <header className="absolute top-0 left-0 w-full p-4 md:p-6 z-10">
        <div className="md:container md:mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Student Portal</span>
          </Link>
          <Button variant="outline" onClick={() => navigate('/teacher/login')}>
            Teacher Login
            <LogIn className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* --- UI/UX Improvement: Animated, focused main content area instead of a basic card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center space-y-8 rounded-xl border bg-background/80 p-8 text-center shadow-lg backdrop-blur-sm"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Join Your Session</h1>
          <p className="text-muted-foreground">Enter the 6-Digit code from your teacher.</p>
        </div>

        <div className="w-full space-y-4">
          {/* --- UI/UX Improvement: A much larger, more prominent input field */}
          <Input
            id="roomId"
            type="number"
            placeholder="******"
            value={roomId}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow up to 6 digits
              if (value.length <= 6) {
                setRoomId(value);
              }
            }}
            onKeyUp={handleKeyUp}
            className="h-10 w-full text-center md:text-xl font-mono uppercase tracking-[0.3em] placeholder:tracking-normal"
            maxLength={6}
          />

          <Button onClick={handleJoinSession} className="w-full" size="lg">
            Join Session
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground px-4">
          💡 Make sure you allow location and camera access when prompted for attendance.
        </p>
      </motion.div>

      {/* --- UI/UX Improvement: Simple footer */}
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground z-10">
        Attendance System | Designed for Modern Classrooms
      </footer>
    </div>
  );
};

export default StudentDashboard;