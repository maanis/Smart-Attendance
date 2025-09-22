import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Search, UserPlus, Edit, Trash2, Eye } from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Students = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [students, setStudents] = useState([]);
    const [pagination, setPagination] = useState(null);

    // Fetch students with search and pagination
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["students", searchTerm, currentPage],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                ...(searchTerm && { search: searchTerm }),
            });

            const response = await axiosInstance.get(`/students?${params}`);
            return response.data;
        },
    });

    useEffect(() => {
        if (data) {
            setStudents(data.students);
            setPagination(data.pagination);
        }
    }, [data]);

    const handleDeleteStudent = async (studentId, studentName) => {
        try {
            await axiosInstance.delete(`/students/${studentId}`);
            toast.success("Student deleted successfully", {
                description: `${studentName} has been removed from the system.`,
            });
            refetch();
        } catch (error) {
            console.error("Delete student error:", error);
            toast.error("Failed to delete student", {
                description: error.message || "An unexpected error occurred.",
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page when searching
        refetch();
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
                <div className="container mx-auto">
                    <Card>
                        <CardContent className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-red-500 mb-2">Failed to load students</p>
                                <p className="text-muted-foreground">{error.message}</p>
                                <Button onClick={() => refetch()} className="mt-4">
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
                <div className="md:container md:mx-auto flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold tracking-tight">All Students</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Student Management
                            </CardTitle>
                            <Badge variant="secondary">
                                {pagination?.totalStudents || 0} Total Students
                            </Badge>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by name or roll number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" variant="outline">
                                Search
                            </Button>
                        </form>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                    <p className="text-muted-foreground">Loading students...</p>
                                </div>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-2">No students found</p>
                                <p className="text-sm text-muted-foreground">
                                    {searchTerm ? "Try adjusting your search terms" : "Add your first student to get started"}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Roll Number</TableHead>
                                                <TableHead>Face Recognition</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={student.profileImage} alt={student.name} />
                                                                <AvatarFallback>
                                                                    {student.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{student.name}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{student.roll}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={student.hasFaceEmbeddings ? "default" : "secondary"}>
                                                            {student.hasFaceEmbeddings ? "Enabled" : "Not Set"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(student.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete {student.name}? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-destructive hover:bg-destructive/90"
                                                                            onClick={() => handleDeleteStudent(student.id, student.name)}
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {((pagination.currentPage - 1) * 10) + 1} to{" "}
                                            {Math.min(pagination.currentPage * 10, pagination.totalStudents)} of{" "}
                                            {pagination.totalStudents} students
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={!pagination.hasPrev}
                                            >
                                                Previous
                                            </Button>
                                            <span className="flex items-center px-3 text-sm">
                                                Page {pagination.currentPage} of {pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                                disabled={!pagination.hasNext}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Students;