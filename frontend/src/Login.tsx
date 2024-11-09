import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

// Set global defaults for Axios
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';

interface FormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();  // Initialize the useNavigate hook

    // Initialize CSRF token by making a request to the Laravel endpoint
    const initializeCSRFToken = async () => {
        try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie');
        } catch (err) {
            setError('Could not initialize CSRF token');
        }
    };

    // Initialize CSRF token when the component mounts
    useEffect(() => {
        initializeCSRFToken();
    }, []);

    // Handle form input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
    
        try {
            // Get CSRF token from the browser cookies
            const csrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
    
            // If CSRF token is found, decode it
            const decodedCsrfToken = csrfToken ? decodeURIComponent(csrfToken) : '';
    
            // Make login request with CSRF token
            const response = await axios.post(
                'http://localhost:8000/login',  // Your Laravel login endpoint
                formData,  // Send the form data in the request body
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': decodedCsrfToken,  // Include CSRF token here
                    },
                    withCredentials: true,  // Include cookies (this ensures CSRF cookie is sent with the request)
                }
            );
    
            setSuccess('Login successful!');
            navigate('/dashboard');  // Redirect after successful login
    
        } catch (error: any) {
            if (error.response) {
                setError(error.response.data.message || 'Something went wrong');
            } else {
                setError('An unexpected error occurred');
            }
        }
    };
    

    return (
        <div className='h-screen bg-stone-800'>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Password:
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
