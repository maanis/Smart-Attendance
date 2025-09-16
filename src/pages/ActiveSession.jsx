import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, Users, BookOpen } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { attendanceStore } from "@/store/attendanceStore";

const ActiveSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [timeLeft, setTimeLeft] = useState("");
  
  const session = sessionId ? attendanceStore.getSession(sessionId) : null;

  useEffect(() => {
    if (!session) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(session.createdAt.getTime() + session.duration * 60000);
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Expired");
        // Auto-close expired session
        attendanceStore.closeSession(session.id);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleCloseSession = () => {
    if (session) {
      attendanceStore.closeSession(session.id);
      navigate(`/teacher/attendance/${session.id}`);
    }
  };

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
  }

  return (
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
            <Badge variant={session.status === 'open' ? 'default' : 'secondary'} className="text-sm">
              {session.status === 'open' ? '🟢 Open' : '🔴 Closed'}
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
                  <p className="text-2xl font-mono font-bold">{session.id}</p>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <h3 className="font-semibold text-accent">Subject</h3>
                  <p className="text-lg font-medium">{session.subject}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Class</h3>
                  <p className="text-lg">{session.course} {session.year} - {session.division}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Teacher</h3>
                  <p className="text-lg">{session.teacherName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Status */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Time Remaining</h3>
                <p className="text-2xl font-mono font-bold text-primary">{timeLeft}</p>
                <p className="text-sm text-muted-foreground mt-1">Duration: {session.duration} minutes</p>
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
                <p className="text-2xl font-bold text-success">{session.attendees.length}</p>
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
                >
                  Close Session
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate(`/teacher/attendance/${session.id}`)}
                >
                  View Attendance List
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendees */}
          {session.attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendees</CardTitle>
                <CardDescription>
                  Latest students who marked attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.attendees.slice(-5).reverse().map((attendee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-muted-foreground">Roll No: {attendee.rollNo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{attendee.time}</p>
                        <Badge variant="outline" className="text-xs">
                          {attendee.status}
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