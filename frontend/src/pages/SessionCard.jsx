// src/components/dashboard/SessionCard.jsx

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Clock, Eye, XCircle, Code, BookOpen } from "lucide-react";

const SessionCard = ({ session, onClose, onView }) => {

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <Card className={`transition-colors ${session.isActive ? 'hover:border-primary/50' : 'border-muted'}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        {/* Live indicator only for active sessions */}
                        {session.isActive && (
                            <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-green-500"></span>
                            </span>
                        )}
                        <span className="truncate">{session.subject}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Code className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="font-mono truncate">{session.sessionId}</span>
                    </div>
                </div>
                {/* Badges for class details - hide on mobile */}
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">{session.course}</Badge>
                    <Badge variant="secondary" className="text-xs">{session.year}</Badge>
                    <Badge variant="outline" className="text-xs">Div {session.division}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><Users className="h-3 w-3 sm:h-4 sm:w-4" /> {session.attendanceCount}</div>
                            <div className="flex items-center gap-1"><MapPin className="h-3 w-3 sm:h-4 sm:w-4" /> {session.radius}m</div>
                            <div className="flex items-center gap-1"><Clock className="h-3 w-3 sm:h-4 sm:w-4" /> {formatTime(session.createdAt)}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" size="sm" onClick={onView} className="w-full sm:w-auto text-xs sm:text-sm">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> View
                            </Button>
                            {/* Close button only for active sessions */}
                            {session.isActive && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Close
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently close the session <span className="font-bold font-mono">{session.sessionId}</span>. Students will no longer be able to mark their attendance.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={onClose}>Yes, close session</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SessionCard;