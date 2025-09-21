// src/components/session/RecentAttendeesList.jsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

// Function to get initials from a name
const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const RecentAttendeesList = ({ attendees }) => (
    <Card className="sticky top-24">
        <CardHeader>
            <CardTitle>Recent Attendees</CardTitle>
            <CardDescription>The last 5 students to join.</CardDescription>
        </CardHeader>
        <CardContent>
            {attendees && attendees.length > 0 ? (
                <div className="space-y-4">
                    {attendees.slice(-5).reverse().map((att, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${att.name}`} alt={att.name} />
                                    <AvatarFallback>{getInitials(att.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{att.name}</p>
                                    <p className="text-xs text-muted-foreground">Roll: {att.rollNo}</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm font-medium">No attendees yet</p>
                    <p className="text-xs">Waiting for students to join...</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default RecentAttendeesList;