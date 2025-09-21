import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator"; // For visual separation
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import useSession from "@/hooks/useSession";
import axiosInstance from "@/utils/axiosInstance";
import { motion } from "framer-motion"; // For animations
import {
  AlertCircle, Loader2, CheckCircle, GraduationCap, Calendar, Hash, Building, Camera, RotateCcw
} from "lucide-react";

// --- UI IMPROVEMENT: A dedicated component for the full-screen status pages (loading, error)
// This keeps the main return statement cleaner without changing any logic.
const StatusScreen = ({ icon, title, message, children }) => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-4 rounded-lg border bg-card p-8 text-center"
    >
      <div className="flex justify-center">{icon}</div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{message}</p>
      {children}
    </motion.div>
  </div>
);


const AttendanceForm = () => {
  // --- ALL LOGIC REMAINS UNCHANGED ---
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({ rollNo: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const { data: session, isLoading, error } = useSession(sessionId);

  // Camera related state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  console.log(error, session)
  // const session = sessionData?.session;

  useEffect(() => {
    if (session && session.isLocationRequired) {
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
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser.");
      }
    }
  }, [session]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Camera functions
  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 } // Front camera only
      });
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;
      setIsCameraOpen(true); // Set state first to render video element

      // Use setTimeout to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Setting video srcObject');
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, playing video');
            videoRef.current.play();
          };
        } else {
          console.error('Video ref is still null after timeout');
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera Error', { description: 'Unable to access front camera. Please check permissions.' });
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
      setCapturedImage(file);
      // Don't stop camera here, so user can retake easily
      setIsCapturing(false);
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.rollNo.trim() || !formData.name.trim()) {
      toast.error("Missing Information", { description: "Please fill in all required fields." });
      return;
    }
    if (!session) {
      toast.error("Session Error", { description: "Session not found." });
      return;
    }
    if (!session.isActive) {
      toast.error("Session Closed", { description: "This session is no longer accepting attendance." });
      return;
    }
    if (session.isLocationRequired && !currentLocation) {
      toast.error("Location Required", { description: "Unable to get your location. Please enable location services and try again." });
      return;
    }
    if ((session.isFaceRecogRequired || true) && !capturedImage) {
      toast.error("Face Image Required", { description: "Please capture your face image for verification." });
      return;
    }
    setIsSubmitting(true);
    try {
      let deviceId = localStorage.getItem('roomcheckr_deviceId');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('roomcheckr_deviceId', deviceId);
      }

      const formDataToSend = new FormData();
      formDataToSend.append('sessionId', session.sessionId);
      formDataToSend.append('rollNo', formData.rollNo.trim());
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('deviceId', deviceId);
      formDataToSend.append('ip', null);
      if (session.isLocationRequired && currentLocation) {
        formDataToSend.append('geoLocation', JSON.stringify(currentLocation));
      }

      if (capturedImage) {
        formDataToSend.append('faceImage', capturedImage);
      }

      const { data } = await axiosInstance.post("/sessions/attendance", formDataToSend);
      toast.success("Attendance Marked!", { description: "Your attendance has been recorded successfully." });
      stopCamera(); // Stop camera after successful submission
      // Small delay to ensure camera is fully stopped before navigation
      setTimeout(() => {
        navigate("/student/confirmation");
      }, 100);
    } catch (error) {
      console.error("Mark attendance error:", error);
      toast.error("Attendance Failed", { description: error.response?.data?.error || error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI FOR RENDER STATES IS MODERNIZED ---
  if (isLoading) {
    return <StatusScreen icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title="Loading Session..." message="Getting everything ready for you." />;
  }

  if (error || !session) {
    return (
      <StatusScreen
        icon={<AlertCircle className="h-10 w-10 text-destructive" />}
        title="Session Error"
        message={error?.message || "The session code is invalid or the session has expired."}
      >
        <Button onClick={() => navigate("/")} className="w-full mt-4">Go Back</Button>
      </StatusScreen>
    );
  }

  if (!session.isActive) {
    return (
      <StatusScreen
        icon={<AlertCircle className="h-10 w-10 text-destructive" />}
        title="Session Closed"
        message="This session is no longer accepting attendance."
      >
        <Button onClick={() => navigate("/")} className="w-full mt-4">Go Back</Button>
      </StatusScreen>
    );
  }

  // --- MAIN FORM UI IS MODERNIZED ---
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-xl border bg-card/80 shadow-lg backdrop-blur-sm"
      >
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Mark Attendance</CardTitle>
            <Badge variant="secondary" className="font-mono tracking-widest">{session.sessionId}</Badge>
          </div>
          <CardDescription>Confirm the class details and enter your info below.</CardDescription>
        </CardHeader>

        <div className="bg-muted/30 p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /> <strong>{session.subject}</strong></div>
            <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /> {session.course}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {session.year} Year</div>
            <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-muted-foreground" /> Division {session.division}</div>
          </div>
        </div>

        <Separator />

        <CardContent className="p-6">
          <div className="space-y-6">
            {session.isLocationRequired && (
              <Alert
                variant={locationError ? "destructive" : "default"}
                className="flex items-start gap-3 p-4 rounded-xl shadow-sm transition-all duration-300 bg-white dark:bg-gray-800"
              >
                <div className="mt-1">
                  {!currentLocation && !locationError ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : locationError ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>

                <div className="flex-1">
                  <AlertTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Location Status
                  </AlertTitle>
                  <AlertDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {locationError
                      ? locationError
                      : !currentLocation
                        ? "Searching for your location..."
                        : "Location found successfully!"}
                  </AlertDescription>
                </div>
              </Alert>
            )}


            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll Number *</Label>
              <Input id="rollNo" type="text" placeholder="Enter your roll number" value={formData.rollNo} onChange={(e) => handleInputChange("rollNo", e.target.value)} disabled={isSubmitting} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" type="text" placeholder="Enter your full name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} disabled={isSubmitting} />
            </div>

            {(session.isFaceRecogRequired || true) && ( // TEMP: Force show for testing
              <div className="space-y-4">
                <Label>Face Verification *</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Session requires face recognition: {session.isFaceRecogRequired ? 'Yes' : 'No (forced for testing)'}
                </div>
                {!capturedImage ? (
                  <div className="space-y-2">
                    {!isCameraOpen ? (
                      <Button onClick={startCamera} variant="outline" className="w-full" disabled={isSubmitting}>
                        <Camera className="mr-2 h-4 w-4" />
                        Open Camera
                      </Button>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-48 h-48 rounded-full border-4 border-primary bg-black"
                            style={{ transform: 'scaleX(-1)', objectFit: 'cover' }} // Mirror the video for selfie view
                          />
                          <div className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"></div>
                        </div>
                        <Button onClick={captureImage} className="w-full" disabled={isCapturing}>
                          {isCapturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                          {isCapturing ? 'Capturing...' : 'Capture Face'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={URL.createObjectURL(capturedImage)}
                        alt="Captured face"
                        className="w-48 h-48 rounded-full object-cover border-4 border-green-500"
                      />
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Face captured successfully!</span>
                      </div>
                    </div>
                    <Button onClick={async () => {
                      setCapturedImage(null);
                      await startCamera();
                    }} variant="outline" className="w-full" disabled={isSubmitting}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retake Photo
                    </Button>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting || (session.isLocationRequired && !currentLocation) || ((session.isFaceRecogRequired || true) && !capturedImage)}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Marking Attendance...</> : "Mark My Attendance"}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")} className="w-full" disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </motion.div>
    </div>
  );
};

export default AttendanceForm;