import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Set global defaults for Axios
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
axios.defaults.headers.common['Accept'] = 'application/json';


const Dashboard: React.FC = () => {
    const [user, setUser] = useState<{ name: string } | null>(null);  // State to hold the user info
    const [error, setError] = useState<string | null>(null);  // State for handling errors
    const navigate = useNavigate();  // Hook for redirecting after logout

    // Fetch user data when the component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Make an API call to fetch user data
                const response = await axios.get('http://localhost:8000/user');
                setUser(response.data);  // Set user data in state
            } catch (error) {
                setError('Failed to fetch user data');
                console.error(error);
            }
        };

        fetchUser();  // Call fetchUser on mount
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            // Retrieve CSRF token from cookies
            const csrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
    
            if (!csrfToken) {
                console.error('CSRF token is missing');
                return;
            }
    
            // Send the logout request with CSRF token
            await axios.post('http://localhost:8000/logout', {}, {
                withCredentials: true,
                headers: {
                    'X-XSRF-TOKEN': decodeURIComponent(csrfToken),  // Include CSRF token
                    'Accept': 'application/json',  // Make sure the backend knows you expect JSON response
                }
            });
    
            // Redirect the user to the login page after successful logout
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            if (error.response) {
                console.log(error.response);  // Log the full error response for further investigation
            }
        }
    };
    

    return (
        <div>
            <h2>Dashboard</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {user ? (
                <p>Welcome, {user.name}!</p>  // Display the user's name
            ) : (
                <p>Loading user information...</p>
            )}
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
};

export default Dashboard;