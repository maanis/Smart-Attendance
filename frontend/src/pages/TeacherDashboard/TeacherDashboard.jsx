// src/pages/TeacherDashboard.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Clock, LogOut } from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import CreateSessionForm from "./CreateSessionForm";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);


  // Note: Auto-close logic is now handled within ActiveSessionsList component

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation is not supported by this browser"));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        (error) => reject(new Error("Unable to get location: " + error.message)),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleCreateSession = async (formData) => {
    if (!formData.subject || !formData.course || !formData.year || !formData.division) {
      toast.error("Missing Information", { description: "Please fill in all required fields." });
      return;
    }
    setIsCreating(true);
    try {
      const currentLocation = await getCurrentLocation();
      const payload = {
        ...formData,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        room: formData.room || "",
      };

      const { data } = await axiosInstance.post("/sessions/create", payload);
      toast.success("Session Created Successfully!", { description: `Session ID: ${data.session.sessionId}` });
      navigate(`/teacher/session/${data.session.sessionId}`);
    } catch (error) {
      console.error("Create session error:", error);
      toast.error("Failed to Create Session", { description: error.message || "An unexpected error occurred." });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call the logout API to clear server-side token
      await axiosInstance.post("/auth/logout");

      // Remove token from localStorage
      localStorage.removeItem("token");

      // Show success message
      toast.success("Logged Out", { description: "You have been successfully logged out." });

      // Navigate to login page
      navigate("/teacher/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout Failed", { description: "There was an error logging out. Please try again." });

      // Even if API call fails, still remove local token and redirect
      localStorage.removeItem("token");
      navigate("/teacher/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      {/* IMPROVEMENT: A more modern and functional header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <div className="md:container md:mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Create Session</h1>
          </div>
          {/* Logout button with functionality */}
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {/* Session Creation Form */}
        <div className="max-w-2xl mx-auto">
          <CreateSessionForm
            isCreating={isCreating}
            onCreateSession={handleCreateSession}
          />
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;