import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Clock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { attendanceStore } from "@/store/attendanceStore";

const AttendanceConfirmation = () => {
  const navigate = useNavigate();
  const submission = attendanceStore.getCurrentStudentSubmission();

  useEffect(() => {
    // If no submission data, redirect to student dashboard
    if (!submission) {
      navigate("/student");
    }
  }, [submission, navigate]);

  if (!submission) {
    return null; // Will redirect in useEffect
  }

  const getStatusConfig = () => {
    switch (submission.status) {
      case 'success':
        return {
          icon: CheckCircle,
          title: "Attendance Marked Successfully! ✅",
          description: `Your attendance has been recorded at ${submission.time}`,
          bgColor: "bg-success/10",
          textColor: "text-success",
          borderColor: "border-success/20"
        };
      case 'already_submitted':
        return {
          icon: AlertCircle,
          title: "Already Submitted",
          description: `You already marked attendance at ${submission.time}`,
          bgColor: "bg-warning/10",
          textColor: "text-warning",
          borderColor: "border-warning/20"
        };
      case 'session_closed':
        return {
          icon: XCircle,
          title: "Session Closed",
          description: "This session is no longer accepting attendance",
          bgColor: "bg-destructive/10",
          textColor: "text-destructive",
          borderColor: "border-destructive/20"
        };
      default:
        return {
          icon: XCircle,
          title: "Error",
          description: "Something went wrong",
          bgColor: "bg-destructive/10",
          textColor: "text-destructive",
          borderColor: "border-destructive/20"
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const handleBackToDashboard = () => {
    attendanceStore.clearCurrentStudentSubmission();
    navigate("/student");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-accent" />
              <h1 className="text-xl font-semibold">Attendance Status</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Status Card */}
          <Card className={`${config.bgColor} ${config.borderColor} border`}>
            <CardContent className="p-8 text-center">
              <IconComponent className={`h-16 w-16 mx-auto mb-4 ${config.textColor}`} />
              <h2 className={`text-2xl font-bold mb-2 ${config.textColor}`}>
                {config.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {config.description}
              </p>
              
              {submission.status === 'success' && (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Recorded at {submission.time}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Details */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
              <CardDescription>
                Information about your attendance submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-medium">{submission.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-mono font-medium">{submission.rollNo}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Session ID</p>
                    <p className="font-mono font-medium">{submission.sessionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{submission.time}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleBackToDashboard} className="flex-1" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                {submission.status === 'session_closed' && (
                  <Link to="/student" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      Join Another Session
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center text-sm text-muted-foreground space-y-2">
                {submission.status === 'success' && (
                  <>
                    <p>🎉 Great! Your attendance has been successfully recorded.</p>
                    <p>📧 You may receive a confirmation email shortly.</p>
                  </>
                )}
                {submission.status === 'already_submitted' && (
                  <>
                    <p>ℹ️ You have already marked attendance for this session.</p>
                    <p>📝 Check with your teacher if you need to make any changes.</p>
                  </>
                )}
                {submission.status === 'session_closed' && (
                  <>
                    <p>⏰ This session has ended and is no longer accepting attendance.</p>
                    <p>👨‍🏫 Contact your teacher for assistance if needed.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AttendanceConfirmation;