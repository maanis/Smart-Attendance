import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Plus, ArrowLeft, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { attendanceStore } from "@/store/attendanceStore";
import { useToast } from "@/hooks/use-toast";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: "",
    course: "",
    year: "",
    division: "",
    radius: 50,
    duration: 60,
  });

  const currentSession = attendanceStore.getCurrentSession();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateSession = () => {
    if (!formData.subject || !formData.course || !formData.year || !formData.division) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const sessionId = attendanceStore.createSession({
      ...formData,
      teacherName: "Dr. Smith", // Mock teacher name
    });

    toast({
      title: "Session Created",
      description: `Room ID: ${sessionId}`,
    });

    navigate(`/teacher/session/${sessionId}`);
  };

  const handleCloseSession = () => {
    if (currentSession) {
      attendanceStore.closeSession(currentSession.id);
      navigate(`/teacher/attendance/${currentSession.id}`);
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

                  <Button onClick={handleCreateSession} className="w-full" size="lg">
                    Create Session
                  </Button>
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