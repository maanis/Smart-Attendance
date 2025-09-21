// src/components/session/SessionStatCards.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, MapPin } from "lucide-react";

// Helper function to format time
const formatTimeLeft = (minutes) => {
    if (minutes <= 0) return "EXPIRED";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
};

const StatCard = ({ icon, title, value, colorClass, footer }) => (
    <Card className={`flex-1 ${colorClass}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{footer}</p>
        </CardContent>
    </Card>
);

const SessionStatCards = ({ session, minutesLeft }) => {
    const isExpiring = minutesLeft <= 10 && minutesLeft > 0;
    const isExpired = minutesLeft <= 0;

    const timeColor = isExpired ? "text-red-500" : isExpiring ? "text-orange-500" : "text-primary";
    const timeFooter = isExpired ? "Session auto-closed" : isExpiring ? "Expires soon!" : "Remaining";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
                icon={<Clock className={`h-4 w-4 text-muted-foreground ${timeColor}`} />}
                title="Time Left"
                value={<span className={timeColor}>{formatTimeLeft(minutesLeft)}</span>}
                footer={timeFooter}
            />
            <StatCard
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                title="Attendees"
                value={session.attendance.length}
                footer="Students present in session"
            />
            {session.isLocationRequired && (
                <StatCard
                    icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    title="Radius"
                    value={`${session.radius}m`}
                    footer="Geofencing coverage area"
                />
            )}
        </div>
    );
};

export default SessionStatCards;