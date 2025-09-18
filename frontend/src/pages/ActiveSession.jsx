import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, Users, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSession from "@/hooks/useSession";

const ActiveSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [remainingMinutes, setRemainingMinutes] = useState(60);
  const [timeLeft, setTimeLeft] = useState("");
  const [isAutoClosing, setIsAutoClosing] = useState(false);

  const { data: session, isLoading, error, refetch } = useSession(sessionId);

  // Calculate time remaining and auto-close session when duration exceeded
  useEffect(() => {
    if (!session?.createdAt || !session?.isActive) return;

    const checkSessionDuration = () => {
      const createdTime = new Date(session.createdAt);
      const now = new Date();
      const elapsed = Math.floor((now - createdTime) / 1000 / 60); // minutes elapsed

      // Default duration of 60 minutes (can be made configurable)
      const totalDuration = 60;
      const remaining = Math.max(0, totalDuration - elapsed);

      setRemainingMinutes(remaining);

      // Auto-close session if duration exceeded and session is still active
      if (remaining <= 0 && session.isActive && !isAutoClosing) {
        setIsAutoClosing(true);
        handleAutoCloseSession();
        return;
      }

      // Show warning when session is about to expire
      if (remaining <= 5 && remaining > 0 && session.isActive) {
        console.warn(`⚠️ Session expires in ${remaining} minutes!`);
      }

      const hours = Math.floor(remaining / 60);
      const minutes = remaining % 60;

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    // Check immediately
    checkSessionDuration();

    // Check every minute for active sessions, every 5 seconds when close to expiry
    const interval = session?.isActive && remainingMinutes <= 10
      ? setInterval(checkSessionDuration, 5000) // Check every 5 seconds when < 10 min
      : setInterval(checkSessionDuration, 60000); // Check every minute otherwise

    return () => clearInterval(interval);
  }, [session, isAutoClosing, remainingMinutes]);

  const handleAutoCloseSession = async () => {
    if (!session) return;

    try {
      const response = await fetch("http://localhost:5000/api/sessions/close", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to auto-close session");
      }

      // Refetch session data to update UI
      refetch();

      // Show notification that session was auto-closed
      console.log("Session auto-closed due to duration exceeded");

    } catch (error) {
      console.error("Auto-close session error:", error);
    } finally {
      setIsAutoClosing(false);
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;

    try {
      const response = await fetch("http://localhost:5000/api/sessions/close", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to close session");
      }

      // Refetch session data to update UI
      refetch();

      // Navigate to attendance list
      navigate(`/teacher/attendance/${session.sessionId}`);
    } catch (error) {
      console.error("Close session error:", error);
      // You could add toast notification here
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Loading Session</h2>
            <p className="text-muted-foreground">Please wait while we fetch session details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Session</h2>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
            <Link to="/teacher">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session not found
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested session could not be found.</p>
            <Link to="/teacher">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  } return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/teacher">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Active Session</h1>
              </div>
            </div>
            <Badge variant={session.isActive ? 'default' : 'secondary'} className="text-sm">
              {session.isActive ? '🟢 Active' : '🔴 Closed'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Session Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Session Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-semibold text-primary">Room ID</h3>
                  <p className="text-2xl font-mono font-bold">{session.sessionId}</p>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <h3 className="font-semibold text-accent">Status</h3>
                  <p className="text-lg font-medium">{session.isActive ? 'Active' : 'Closed'}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-sm">
                    {session.location.latitude.toFixed(4)},<br />
                    {session.location.longitude.toFixed(4)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Created</h3>
                  <p className="text-sm">
                    {new Date(session.createdAt).toLocaleDateString()}<br />
                    {new Date(session.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Status */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className={`h-8 w-8 mx-auto mb-3 ${remainingMinutes <= 10 && remainingMinutes > 0 ? 'text-orange-500' :
                  remainingMinutes <= 0 ? 'text-red-500' : 'text-primary'
                  }`} />
                <h3 className="font-semibold mb-2">Time Remaining</h3>
                <p className={`text-2xl font-mono font-bold ${remainingMinutes <= 10 && remainingMinutes > 0 ? 'text-orange-500' :
                  remainingMinutes <= 0 ? 'text-red-500' : 'text-primary'
                  }`}>
                  {remainingMinutes <= 0 ? 'EXPIRED' : timeLeft}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {remainingMinutes <= 10 && remainingMinutes > 0
                    ? '⚠️ Session expires soon!'
                    : remainingMinutes <= 0
                      ? 'Session auto-closed'
                      : `Session created: ${new Date(session.createdAt).toLocaleTimeString()}`
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Radius</h3>
                <p className="text-2xl font-bold text-accent">{session.radius}m</p>
                <p className="text-sm text-muted-foreground mt-1">Coverage area</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-success" />
                <h3 className="font-semibold mb-2">Attendees</h3>
                <p className="text-2xl font-bold text-success">{session.attendance.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Students present</p>
              </CardContent>
            </Card>
          </div>

          {/* Session Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Session Controls</CardTitle>
              <CardDescription>
                Manage your current attendance session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleCloseSession}
                  variant="destructive"
                  size="lg"
                  className="flex-1"
                  disabled={!session.isActive || remainingMinutes <= 0 || isAutoClosing}
                >
                  {isAutoClosing
                    ? 'Auto-Closing...'
                    : remainingMinutes <= 0
                      ? 'Session Expired'
                      : 'Close Session'
                  }
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate(`/teacher/attendance/${session.sessionId}`)}
                >
                  View Attendance List
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendees */}
          {session.attendance && session.attendance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendees</CardTitle>
                <CardDescription>
                  Latest students who marked attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.attendance.slice(-5).reverse().map((attendee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-muted-foreground">Roll No: {attendee.rollNo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(attendee.timestamp).toLocaleTimeString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Present
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActiveSession;