import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {//this means that we are creating a function called Register
    const [email, setEmail] = useState('');//this means that we are creating a variable called email and a function called setEmail that will be used to update the value of the email variable
    const [password, setPassword] = useState('');//this means that we are creating a variable called password and a function called setPassword that will be used to update the value of the password variable
    const [message, setMessage] = useState('');//this means that we are creating a variable called message and a function called setMessage that will be used to update the value of the message variable
    const navigate = useNavigate();//this means that we are creating a variable called navigate that will be used to navigate to a different page

    const handleSubmit = async (e) => {//this means that we are creating a function called handleSubmit that will be used to handle the form submission
        e.preventDefault();//this means that we are preventing the default form submission behavior so that we can handle the form submission ourselves
        try {
            const response = await axios.post('http://127.0.0.1:8000/register', {//this means that we are sending a POST request to the server with the email and password so that the user can be registered
                email,//this email is the email that the user entered in the form
                password,//this password is the password that the user entered in the form
            });
            setMessage(response.data.message);//this means that we are setting the message to the response message
            // Redirect to login on success
            navigate('/login');//this means that we are redirecting the user to the login page on success
        } catch (error) {
            if (error.response) {//this means that we are checking if the error has a response
                setMessage('Error: ' + error.response.data.error);
            } else if (error.request) {
                setMessage('Error: No response from server');
            } else {
                setMessage('Error: ' + error.message);
            }
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Register;
