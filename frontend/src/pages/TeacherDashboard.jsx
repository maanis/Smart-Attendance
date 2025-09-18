import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Plus, ArrowLeft, Users, MapPin, Loader2, Clock, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { attendanceStore } from "@/store/attendanceStore";
import { toast } from "sonner";
import useActiveSessions from "@/hooks/useActiveSessions";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    course: "",
    year: "",
    division: "",
    room: "",
    radius: 50,
    duration: 60,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [location, setLocation] = useState(null);

  const currentSession = attendanceStore.getCurrentSession();
  const { data: activeSessions, isLoading: sessionsLoading, error: sessionsError } = useActiveSessions();

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error("Unable to get location: " + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // 5 minutes
        }
      );
    });
  };

  const handleCreateSession = async () => {
    if (!formData.subject || !formData.course || !formData.year || !formData.division) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get current location
      const currentLocation = await getCurrentLocation();

      // Make API call to create session
      const response = await fetch("http://localhost:5000/api/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          radius: formData.radius,
          subject: formData.subject,
          course: formData.course,
          year: formData.year,
          division: formData.division,
          room: formData.room || "",
          duration: formData.duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create session");
      }

      const data = await response.json();

      toast.success("Session Created", {
        description: `Room ID: ${data.session.sessionId}`,
      });

      // Store session in local store for UI purposes
      attendanceStore.createSession({
        ...formData,
        id: data.session.sessionId,
        location: currentLocation,
        teacherName: "Teacher", // This should come from authenticated user
      });

      navigate(`/teacher/session/${data.session.sessionId}`);
    } catch (error) {
      console.error("Create session error:", error);
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCloseSession = () => {
    if (currentSession) {
      attendanceStore.closeSession(currentSession.id);
      navigate(`/teacher/attendance/${currentSession.id}`);
    }
  };

  const handleCloseSessionFromList = async (sessionId) => {
    try {
      const response = await fetch("http://localhost:5000/api/sessions/close", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to close session");
      }

      toast.success("Session Closed", {
        description: `Session ${sessionId} has been closed successfully.`,
      });

      // Refetch active sessions to update the list
      // Note: This would require invalidating the query cache
      // For now, we'll just show a success message
    } catch (error) {
      console.error("Close session error:", error);
      toast.error("Error", {
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Generate Room</span>
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center space-x-2" disabled={!currentSession}>
                <QrCode className="h-4 w-4" />
                <span>Generate QR</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Session</CardTitle>
                  <CardDescription>
                    Set up a new attendance session for your class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          placeholder="e.g., Computer Networks"
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="course">Course *</Label>
                        <Select value={formData.course} onValueChange={(value) => handleInputChange("course", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MCA">MCA</SelectItem>
                            <SelectItem value="BCA">BCA</SelectItem>
                            <SelectItem value="BBA">BBA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="year">Year *</Label>
                        <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FY">First Year</SelectItem>
                            <SelectItem value="SY">Second Year</SelectItem>
                            <SelectItem value="TY">Third Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="division">Division *</Label>
                        <Select value={formData.division} onValueChange={(value) => handleInputChange("division", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Division A</SelectItem>
                            <SelectItem value="B">Division B</SelectItem>
                            <SelectItem value="C">Division C</SelectItem>
                            <SelectItem value="D">Division D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="room">Room (Optional)</Label>
                        <Input
                          id="room"
                          placeholder="e.g., Room 101"
                          value={formData.room}
                          onChange={(e) => handleInputChange("room", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="radius">Radius (meters)</Label>
                        <Input
                          id="radius"
                          type="number"
                          value={formData.radius}
                          onChange={(e) => handleInputChange("radius", parseInt(e.target.value) || 50)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 60)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>Your current location will be used for session geofencing</span>
                  </div>

                  <Button onClick={handleCreateSession} className="w-full" size="lg" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Session...
                      </>
                    ) : (
                      "Create Session"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Active Sessions Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Active Sessions</span>
                  </CardTitle>
                  <CardDescription>
                    Your currently running attendance sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading active sessions...</span>
                    </div>
                  ) : sessionsError ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Failed to load active sessions</p>
                      <p className="text-sm">{sessionsError.message}</p>
                    </div>
                  ) : activeSessions && activeSessions.length > 0 ? (
                    <div className="space-y-4">
                      {activeSessions.map((session) => (
                        <div key={session.sessionId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="text-lg font-mono font-bold text-primary">
                                  {session.sessionId}
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{session.radius}m radius</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{session.attendanceCount} attendees</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Created {new Date(session.createdAt).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/teacher/session/${session.sessionId}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCloseSessionFromList(session.sessionId)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No Active Sessions</p>
                      <p className="text-sm">Create a new session to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr">
              {currentSession && (
                <Card>
                  <CardHeader>
                    <CardTitle>Session QR Code</CardTitle>
                    <CardDescription>
                      Students can scan this QR code to join the session
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div className="bg-muted p-8 rounded-lg inline-block">
                      <div className="w-48 h-48 bg-white border-2 border-border rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm font-mono">{currentSession.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p><strong>Room ID:</strong> {currentSession.id}</p>
                      <p><strong>Subject:</strong> {currentSession.subject}</p>
                      <p><strong>Status:</strong> <span className="text-success font-medium">Open</span></p>
                    </div>

                    <Button onClick={handleCloseSession} variant="destructive" size="lg">
                      Close Session
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;