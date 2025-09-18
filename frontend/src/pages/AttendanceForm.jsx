import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, MapPin, Clock, BookOpen, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import useSession from "@/hooks/useSession";

const AttendanceForm = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    rollNo: "",
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  const { data: session, isLoading, error } = useSession(sessionId);

  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError("");
        },
        (error) => {
          setLocationError("Unable to get your location. Please enable location services.");
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // 5 minutes
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.rollNo.trim() || !formData.name.trim()) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (!session) {
      toast.error("Session Error", {
        description: "Session not found.",
      });
      return;
    }

    if (!session.isActive) {
      toast.error("Session Closed", {
        description: "This session is no longer accepting attendance.",
      });
      return;
    }

    if (!currentLocation) {
      toast.error("Location Required", {
        description: "Unable to get your location. Please enable location services and try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get device ID (using a simple hash of user agent + timestamp)
      const deviceId = btoa(navigator.userAgent + Date.now()).substring(0, 16);

      const response = await fetch("http://localhost:5000/api/sessions/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          rollNo: formData.rollNo.trim(),
          name: formData.name.trim(),
          deviceId,
          ip: null, // Will be determined by server
          geoLocation: currentLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark attendance");
      }

      const data = await response.json();

      toast.success("Attendance Marked!", {
        description: "Your attendance has been recorded successfully.",
      });

      navigate("/student/confirmation");
    } catch (error) {
      console.error("Mark attendance error:", error);
      console.log(error)
      toast.error("Attendance Failed", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading session...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Session Error</AlertTitle>
              <AlertDescription>
                {error?.message || "Session not found or has expired."}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/student")}
              className="w-full mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Session Closed</AlertTitle>
              <AlertDescription>
                This session is no longer accepting attendance.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/student")}
              className="w-full mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Mark Attendance
          </CardTitle>
          <CardDescription>
            Session: {session.subject} - {session.room}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {locationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Location Error</AlertTitle>
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="rollNo">Roll Number *</Label>
            <Input
              id="rollNo"
              type="text"
              placeholder="Enter your roll number"
              value={formData.rollNo}
              onChange={(e) => handleInputChange("rollNo", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isSubmitting || !currentLocation}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Marking Attendance...
              </>
            ) : (
              "Mark Attendance"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/student")}
            className="w-full"
            disabled={isSubmitting}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceForm;