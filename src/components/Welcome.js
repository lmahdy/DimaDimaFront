import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/welcome.css';


const Welcome = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            navigate('/login'); // Redirect to login if not authenticated
        } else {
            setEmail(userEmail);
        }
    }, [navigate]);

    return (
        <div>
            <h2>Welcome</h2>
            <p>Hello Mr. {email}</p>
            <button onClick={() => navigate('/notes')}>Go to Notes</button>
        </div>
    );
};

export default Welcome;
