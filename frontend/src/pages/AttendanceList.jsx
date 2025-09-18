import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Users, Calendar, Clock, Loader2, AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import useSession from "@/hooks/useSession";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AttendanceList = () => {
  const { sessionId } = useParams();
  const { data: session, isLoading, error } = useSession(sessionId);

  const handleExportCSV = () => {
    toast.info("Export Feature", {
      description: "CSV export functionality would be implemented here.",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Loading Attendance Report</h2>
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
                <h1 className="text-xl font-semibold">Attendance Report</h1>
              </div>
            </div>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Session Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
              <CardDescription>Overview of the attendance session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-semibold text-primary">Room ID</h3>
                  <p className="text-2xl font-mono font-bold">{session.sessionId}</p>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <h3 className="font-semibold text-accent">Status</h3>
                  <Badge variant={session.isActive ? 'default' : 'secondary'} className="mt-2">
                    {session.isActive ? 'Active' : 'Closed'}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-sm">
                    {session.location.latitude.toFixed(4)},<br />
                    {session.location.longitude.toFixed(4)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">Radius</h3>
                  <p className="text-2xl font-bold">{session.radius}m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-success" />
                <h3 className="font-semibold mb-2">Total Present</h3>
                <p className="text-3xl font-bold text-success">{session.attendance.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Session Date</h3>
                <p className="text-lg font-medium">{new Date(session.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Created At</h3>
                <p className="text-lg font-medium">{new Date(session.createdAt).toLocaleTimeString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance List</CardTitle>
              <CardDescription>
                Students who marked attendance for this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.attendance.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Device ID</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.attendance.map((attendee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{attendee.rollNo}</TableCell>
                          <TableCell>{attendee.name}</TableCell>
                          <TableCell className="font-mono text-sm">{attendee.deviceId}</TableCell>
                          <TableCell className="font-mono text-sm">{attendee.ip || 'N/A'}</TableCell>
                          <TableCell>{new Date(attendee.timestamp).toLocaleTimeString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="default">
                              Present
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Attendance Marked</h3>
                  <p className="text-muted-foreground">
                    No students have marked attendance for this session yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Additional options for this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleExportCSV} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export Attendance
                </Button>
                <Link to="/teacher" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Create New Session
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AttendanceList;