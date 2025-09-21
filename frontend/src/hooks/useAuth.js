import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

const useAuth = () => {
    const navigate = useNavigate();

    const login = async ({ email, password }) => {
        const response = await axiosInstance.post("/auth/login", { email, password });
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    };

    const handleLoginSuccess = () => {
        navigate("/teacher/dashboard");
    };

    return {
        login,
        handleLoginSuccess,
    };
};

export default useAuth;