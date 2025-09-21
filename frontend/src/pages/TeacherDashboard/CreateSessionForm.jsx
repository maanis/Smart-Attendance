import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // --- UI IMPROVEMENT ---
import {
    Plus, Loader2, MapPin, BookOpen, Building2, CalendarDays, Users, DoorOpen, CircleDot, Timer
} from "lucide-react";

const CreateSessionForm = ({ isCreating, onCreateSession }) => {
    // --- ALL LOGIC REMAINS UNCHANGED ---
    const [formData, setFormData] = useState({
        subject: "",
        course: "MCA", // I am a MCA student, so I'll set this as default for my convenience
        year: "FY",
        division: "A",
        room: "",
        radius: 200,
        duration: 15,
        isLocationRequired: true,
        isFaceRecogRequired: false,
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateSession(formData);
    };

    // --- The UI (JSX) is completely modernized ---
    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>Create New Session</span>
                </CardTitle>
                <CardDescription>
                    Fill in the details to start a new attendance session.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* --- UI IMPROVEMENT: More engaging layout for core details --- */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject *</Label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="subject" placeholder="e.g., Artificial Intelligence" value={formData.subject} onChange={(e) => handleInputChange("subject", e.target.value)} required className="pl-10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="course">Course *</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Select value={formData.course} onValueChange={(value) => handleInputChange("course", value)} required>
                                    <SelectTrigger className="pl-10"><SelectValue placeholder="Select course" /></SelectTrigger>
                                    <SelectContent><SelectItem value="MCA">MCA</SelectItem><SelectItem value="BCA">BCA</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Year *</Label>
                                {/* --- UI IMPROVEMENT: Toggle group for faster selection --- */}
                                <ToggleGroup type="single" variant="outline" value={formData.year} onValueChange={(value) => value && handleInputChange("year", value)} className="w-full">
                                    <ToggleGroupItem value="FY" className="w-full">FY</ToggleGroupItem>
                                    <ToggleGroupItem value="SY" className="w-full">SY</ToggleGroupItem>
                                    <ToggleGroupItem value="TY" className="w-full">TY</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div className="space-y-2">
                                <Label>Division *</Label>
                                <ToggleGroup type="single" variant="outline" value={formData.division} onValueChange={(value) => value && handleInputChange("division", value)} className="w-full">
                                    <ToggleGroupItem value="A" className="w-full">A</ToggleGroupItem>
                                    <ToggleGroupItem value="B" className="w-full">B</ToggleGroupItem>
                                    <ToggleGroupItem value="C" className="w-full">C</ToggleGroupItem>
                                    <ToggleGroupItem value="D" className="w-full">D</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* --- UI IMPROVEMENT: Visually distinct section for settings --- */}
                    <div className="space-y-4 rounded-lg bg-muted/30 p-4">
                        <h3 className="text-sm font-medium">Session Settings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="room">Room <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                <div className="relative">
                                    <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="room" placeholder="e.g., 301" value={formData.room} onChange={(e) => handleInputChange("room", e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="radius">Radius (m)</Label>
                                <div className="relative">
                                    <CircleDot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="radius" type="number" value={formData.radius} onChange={(e) => handleInputChange("radius", parseInt(e.target.value))} className="pl-10" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (min)</Label>
                            <div className="relative">
                                <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="duration" type="number" value={formData.duration} onChange={(e) => handleInputChange("duration", parseInt(e.target.value))} className="pl-10" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="isLocationRequired" className="font-medium">Require Geolocation</Label>
                                <p className="text-xs text-muted-foreground mt-1">Students must be within the set radius to mark attendance.</p>
                            </div>
                            <Switch id="isLocationRequired" checked={formData.isLocationRequired} onCheckedChange={(checked) => handleInputChange("isLocationRequired", checked)} />
                        </div>
                        <div className="flex items-start justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="isFaceRecogRequired" className="font-medium">Require Face Recognition</Label>
                                <p className="text-xs text-muted-foreground mt-1">Students must capture their face for biometric verification.</p>
                            </div>
                            <Switch id="isFaceRecogRequired" checked={formData.isFaceRecogRequired} onCheckedChange={(checked) => handleInputChange("isFaceRecogRequired", checked)} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>Your current location will be used for session geofencing.</span>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isCreating}>
                        {isCreating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create Session"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateSessionForm;