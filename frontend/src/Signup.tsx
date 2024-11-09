import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Set global defaults for Axios
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';

// Ensure Axios automatically includes CSRF token
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';  // Set the CSRF token header name (usually default)
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';    // Set the CSRF token cookie name (usually default)

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string; // Changed from passwordConfirmation to password_confirmation
}

const Signup: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '', // Updated to match the backend field name
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Initialize CSRF token by making a request to the Laravel endpoint
    const initializeCSRFToken = async () => {
        try {
            // Ensure CSRF cookie is set
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

        // Check if passwords match
        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Manually retrieve the CSRF token from the cookie
            const csrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            // Decode the CSRF token if it exists
            const decodedCsrfToken = csrfToken ? decodeURIComponent(csrfToken) : '';

            // Send the form data to the Laravel backend
            const response = await axios.post(
                'http://localhost:8000/register',  // Your Laravel registration endpoint
                formData,  // Send the form data in the request body
                {
                    headers: {
                        'Content-Type': 'application/json',  // JSON content type
                        'Accept': 'application/json',        // Accept JSON response
                        'X-XSRF-TOKEN': decodedCsrfToken,    // CSRF token in header
                    }
                }
            );

            // If successful, display a success message
            setSuccess('Signup successful! Please check your email for confirmation.');

        } catch (error: any) {
            // If an error occurs, display the error message
            if (error.response) {
                console.log(error.response);  // Log the full error response to inspect it
                setError(error.response.data.message || 'Something went wrong');
            } else {
                setError('An unexpected error occurred');
            }
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
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
                <div>
                    <label>
                        Confirm Password:
                        <input
                            type="password"
                            name="password_confirmation"  // Updated to match backend expected field name
                            value={formData.password_confirmation}  // Updated to match field name
                            onChange={handleChange}
                            required 
                        />
                    </label>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Signup;
