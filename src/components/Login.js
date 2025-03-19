import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/login', {
                email,
                password,
            });

            // Store token and user ID
            localStorage.setItem('jwtToken', response.data.token);
            localStorage.setItem('userRoles', JSON.stringify(response.data.user.roles));
            localStorage.setItem('userId', response.data.user.id); // Add this in backend response
            localStorage.setItem('userEmail', email);
            
            navigate('/welcome');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {message && <p className="error">{message}</p>}
        </div>
    );
};

export default Login;