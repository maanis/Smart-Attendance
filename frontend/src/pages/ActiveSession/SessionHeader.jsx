// src/components/session/SessionHeader.jsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
const SessionHeader = ({ session }) => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Dashboard</span>
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-lg font-semibold md:text-xl">{session.subject}</h1>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <Badge variant="secondary">{session.course}</Badge>
                        <Badge variant="secondary">{session.year}</Badge>
                        <Badge variant="outline">Div {session.division}</Badge>
                    </div>
                </div>
                <Badge variant={session.isActive ? "default" : "destructive"} className="flex items-center gap-2 text-sm">
                    {session.isActive && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    )}
                    {session.isActive ? 'Live' : 'Closed'}
                </Badge>
            </div>
        </header>
    );

}

export default SessionHeader;