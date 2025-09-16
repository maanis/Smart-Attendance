import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Hash, ArrowLeft, GraduationCap, Camera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { attendanceStore } from "@/store/attendanceStore";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roomId, setRoomId] = useState("");

  const handleJoinSession = () => {
    if (!roomId.trim()) {
      toast({
        title: "Missing Room ID",
        description: "Please enter a valid Room ID.",
        variant: "destructive",
      });
      return;
    }

    const session = attendanceStore.getSession(roomId.toUpperCase());
    if (!session) {
      toast({
        title: "Invalid Room ID",
        description: "Session not found. Please check the Room ID.",
        variant: "destructive",
      });
      return;
    }

    navigate(`/student/attendance/${roomId.toUpperCase()}`);
  };

  const handleQRScan = () => {
    // Simulate QR scan - in real app this would open camera
    // For demo, we'll use the existing session
    const currentSession = attendanceStore.getCurrentSession();
    if (currentSession) {
      navigate(`/student/attendance/${currentSession.id}`);
    } else {
      toast({
        title: "No Active Session",
        description: "No QR code detected. Please try again.",
        variant: "destructive",
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
                <GraduationCap className="h-6 w-6 text-accent" />
                <h1 className="text-xl font-semibold">Student Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Join Attendance Session</h2>
            <p className="text-muted-foreground">Enter Room ID or scan QR code to mark your attendance</p>
          </div>

          <Tabs defaultValue="room-id" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="room-id" className="flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Enter Room ID</span>
              </TabsTrigger>
              <TabsTrigger value="qr-scan" className="flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>Scan QR</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="room-id">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Room ID</CardTitle>
                  <CardDescription>
                    Get the Room ID from your teacher and enter it below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="roomId">Room ID</Label>
                    <Input
                      id="roomId"
                      placeholder="e.g., ABC123XYZ"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="text-center font-mono text-lg"
                    />
                  </div>

                  <Button onClick={handleJoinSession} className="w-full" size="lg">
                    Join Session
                  </Button>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      💡 Room IDs are usually 9 characters long (e.g., ABC123XYZ)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr-scan">
              <Card>
                <CardHeader>
                  <CardTitle>Scan QR Code</CardTitle>
                  <CardDescription>
                    Point your camera at the QR code displayed by your teacher
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="bg-muted/50 p-8 rounded-lg">
                    <Camera className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">QR Scanner</p>
                    <p className="text-sm text-muted-foreground">Click below to simulate scanning</p>
                  </div>

                  <Button onClick={handleQRScan} className="w-full" size="lg">
                    <QrCode className="h-5 w-5 mr-2" />
                    Scan QR Code
                  </Button>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      📱 In a real app, this would open your camera to scan QR codes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;