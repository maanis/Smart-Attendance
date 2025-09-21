// src/components/session/SessionControls.jsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ListChecks } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const SessionControls = ({ session, onClose, onViewAttendance }) => (
    <Card>
        <CardHeader>
            <CardTitle>Session Controls</CardTitle>
            <CardDescription>Manage this session or view the full attendance list.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="lg" disabled={!session.isActive}>
                        <XCircle className="mr-2 h-4 w-4" />
                        {session.isActive ? "Close Session Manually" : "Session Closed"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Closing the session will prevent any more students from joining. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onClose}>Yes, Close It</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" size="lg" onClick={onViewAttendance}>
                <ListChecks className="mr-2 h-4 w-4" />
                View Full Attendance
            </Button>
        </CardContent>
    </Card>
);

export default SessionControls;