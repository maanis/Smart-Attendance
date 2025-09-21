// src/components/session/SessionInfoCard.jsx

import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, QrCode } from "lucide-react";

const SessionInfoCard = ({ session }) => {
    const handleCopyId = () => {
        navigator.clipboard.writeText(session.sessionId);
        toast.success("Session ID Copied!", {
            description: "You can now share it with your students.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Session Access</CardTitle>
                <CardDescription>Share this ID with students to join the session.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-4">
                    <QrCode className="h-10 w-10 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Session ID</p>
                        <p className="text-2xl font-bold font-mono tracking-widest text-primary sm:text-3xl">
                            {session.sessionId}
                        </p>
                    </div>
                </div>
                <Button onClick={handleCopyId} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy ID
                </Button>
            </CardContent>
        </Card>
    );
};

export default SessionInfoCard;