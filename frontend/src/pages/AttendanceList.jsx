import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Users, Calendar, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { attendanceStore } from "@/store/attendanceStore";
import { useToast } from "@/hooks/use-toast";

const AttendanceList = () => {
  const { sessionId } = useParams();
  const { toast } = useToast();
  const session = sessionId ? attendanceStore.getSession(sessionId) : null;

  const handleExportCSV = () => {
    toast({
      title: "Export Feature",
      description: "CSV export functionality would be implemented here.",
    });
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
                  <p className="text-xl font-mono font-bold">{session.id}</p>
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
                  <h3 className="font-semibold">Status</h3>
                  <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                    {session.status === 'open' ? 'Open' : 'Closed'}
                  </Badge>
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
                <p className="text-3xl font-bold text-success">{session.attendees.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Session Date</h3>
                <p className="text-lg font-medium">{session.createdAt.toLocaleDateString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Duration</h3>
                <p className="text-lg font-medium">{session.duration} minutes</p>
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
              {session.attendees.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.attendees.map((attendee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{attendee.rollNo}</TableCell>
                          <TableCell>{attendee.name}</TableCell>
                          <TableCell>{attendee.time}</TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant={attendee.status === 'present' ? 'default' : 'destructive'}
                              className="capitalize"
                            >
                              {attendee.status}
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