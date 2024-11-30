import React from 'react';
import { useLocation } from 'react-router-dom';

const Welcome = () => {
    const location = useLocation();
    const email = location.state?.email || 'User';

    return (
        <div>
            <h2>Welcome</h2>
            <p>Hello Mr. {email}</p>
        </div>
    );
};

export default Welcome;
