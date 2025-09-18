import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

const useAuth = () => {
    const navigate = useNavigate();

    const login = async ({ email, password }) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for httpOnly token
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Login failed");
        }

        const data = await response.json();
        return data;
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