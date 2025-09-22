import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import StudentForm from "./StudentForm";

const AddStudent = () => {
    const navigate = useNavigate();

    const handleStudentCreated = (student) => {
        toast.success("Student added to system", {
            description: `${student.name} is now ready for attendance.`,
        });
        // Optionally navigate back to students list after successful creation
        // navigate("/teacher/students");
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
                <div className="md:container md:mx-auto flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/teacher/students")}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <UserPlus className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold tracking-tight">Add New Student</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-2xl mx-auto">
                    <StudentForm onStudentCreated={handleStudentCreated} />
                </div>
            </main>
        </div>
    );
};

export default AddStudent;