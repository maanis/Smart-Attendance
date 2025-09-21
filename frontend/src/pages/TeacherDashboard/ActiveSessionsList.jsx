// src/components/dashboard/ActiveSessionsList.jsx

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ServerCrash, Clock4, History } from "lucide-react";


import axiosInstance from "@/utils/axiosInstance";
import SessionCard from "../SessionCard";

const ActiveSessionsList = ({ onCloseSession, onViewSession }) => {
    const [allSessions, setAllSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all sessions on mount
    useEffect(() => {
        const fetchAllSessions = async () => {
            try {
                setIsLoading(true);
                const response = await axiosInstance.get('/sessions/all');
                setAllSessions(response.data.sessions);
                setError(null);
            } catch (err) {
                console.error('Error fetching sessions:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllSessions();
    }, []);

    // Filter sessions
    const activeSessions = allSessions.filter(session => session.isActive);
    const historySessions = allSessions.filter(session => !session.isActive);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock4 className="h-5 w-5" />
                    <span>All Sessions</span>
                </CardTitle>
                <CardDescription>
                    View and manage your attendance sessions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                        <TabsTrigger value="active" className="flex sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3">
                            <Clock4 className="h-4 w-4" />
                            <span>Active</span>
                            <span className="sm:hidden">({activeSessions.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3">
                            <History className="h-4 w-4" />
                            <span>History</span>
                            <span className="sm:hidden">({historySessions.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground">
                                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mb-2" />
                                <p className="text-sm sm:text-base">Loading Active Sessions...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-red-500 px-4">
                                <ServerCrash className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                                <p className="text-sm sm:text-base text-center">Failed to load sessions</p>
                                <p className="text-xs text-center">{error.message}</p>
                            </div>
                        ) : activeSessions.length > 0 ? (
                            <div className="grid gap-4 md:gap-6">
                                {activeSessions.map((session) => (
                                    <SessionCard
                                        key={session.sessionId}
                                        session={session}
                                        onClose={() => onCloseSession(session.sessionId)}
                                        onView={() => onViewSession(session.sessionId)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground px-4">
                                <Clock4 className="h-10 w-10 sm:h-12 sm:w-12 mb-4 opacity-50" />
                                <p className="text-base sm:text-lg font-medium text-center">No Active Sessions</p>
                                <p className="text-sm text-center">Create a new session to get started.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground">
                                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mb-2" />
                                <p className="text-sm sm:text-base">Loading Session History...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-red-500 px-4">
                                <ServerCrash className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                                <p className="text-sm sm:text-base text-center">Failed to load sessions</p>
                                <p className="text-xs text-center">{error.message}</p>
                            </div>
                        ) : historySessions.length > 0 ? (
                            <div className="grid gap-4 md:gap-6">
                                {historySessions.map((session) => (
                                    <SessionCard
                                        key={session.sessionId}
                                        session={session}
                                        onClose={() => onCloseSession(session.sessionId)}
                                        onView={() => onViewSession(session.sessionId)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground px-4">
                                <History className="h-10 w-10 sm:h-12 sm:w-12 mb-4 opacity-50" />
                                <p className="text-base sm:text-lg font-medium text-center">No Session History</p>
                                <p className="text-sm text-center">Your completed sessions will appear here.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default ActiveSessionsList;