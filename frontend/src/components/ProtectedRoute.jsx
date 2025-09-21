import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    const { data: authData, isLoading, error } = useQuery({
        queryKey: ['auth-check'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await axiosInstance.get('/auth/isAuthenticated', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data;
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If there's an error or not authenticated, redirect to login
    if (error || !authData?.authenticated) {
        return <Navigate to="/teacher/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;